param(
  [Parameter(Mandatory=$true)]
  [string]$InputPath,

  [Parameter(Mandatory=$true)]
  [string]$OutputPath,

  [int]$CanvasWidth = 1024,
  [int]$CanvasHeight = 1536,
  [int]$Padding = 72
)

Add-Type -AssemblyName System.Drawing

Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @"
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using System.Runtime.InteropServices;

public static class FiveAlphaExporter
{
    public static void Export(string inputPath, string outputPath, int canvasWidth, int canvasHeight, int padding)
    {
        using (var original = new Bitmap(inputPath))
        using (var src = new Bitmap(original.Width, original.Height, PixelFormat.Format32bppArgb))
        using (var prep = Graphics.FromImage(src))
        {
            prep.DrawImage(original, 0, 0, original.Width, original.Height);

            var rect = new Rectangle(0, 0, src.Width, src.Height);
            var data = src.LockBits(rect, ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
            int stride = data.Stride;
            int bytes = Math.Abs(stride) * src.Height;
            byte[] buffer = new byte[bytes];
            Marshal.Copy(data.Scan0, buffer, 0, bytes);
            src.UnlockBits(data);

            bool[] foreground = new bool[src.Width * src.Height];
            int minX = src.Width, minY = src.Height, maxX = -1, maxY = -1;

            for (int y = 0; y < src.Height; y++)
            {
                int row = y * stride;
                for (int x = 0; x < src.Width; x++)
                {
                    int i = row + (x * 4);
                    byte b = buffer[i];
                    byte g = buffer[i + 1];
                    byte r = buffer[i + 2];
                    byte a = buffer[i + 3];
                    bool isKey = g > 90 && g > r * 1.28 && g > b * 1.12;
                    bool isFg = a > 0 && !isKey;
                    foreground[(y * src.Width) + x] = isFg;
                    if (isFg)
                    {
                        if (x < minX) minX = x;
                        if (y < minY) minY = y;
                        if (x > maxX) maxX = x;
                        if (y > maxY) maxY = y;
                    }
                }
            }

            if (maxX < 0 || maxY < 0)
                throw new InvalidOperationException("No foreground detected in " + inputPath);

            int cropW = maxX - minX + 1;
            int cropH = maxY - minY + 1;

            using (var fg = new Bitmap(cropW, cropH, PixelFormat.Format32bppArgb))
            {
                var fgRect = new Rectangle(0, 0, cropW, cropH);
                var fgData = fg.LockBits(fgRect, ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
                int fgStride = fgData.Stride;
                int fgBytes = Math.Abs(fgStride) * cropH;
                byte[] fgBuffer = new byte[fgBytes];

                for (int y = 0; y < cropH; y++)
                {
                    int srcY = y + minY;
                    int srcRow = srcY * stride;
                    int fgRow = y * fgStride;
                    for (int x = 0; x < cropW; x++)
                    {
                        int srcX = x + minX;
                        if (!foreground[(srcY * src.Width) + srcX]) continue;

                        int srcI = srcRow + (srcX * 4);
                        int fgI = fgRow + (x * 4);
                        fgBuffer[fgI] = buffer[srcI];
                        fgBuffer[fgI + 1] = buffer[srcI + 1];
                        fgBuffer[fgI + 2] = buffer[srcI + 2];
                        fgBuffer[fgI + 3] = 255;
                    }
                }

                Marshal.Copy(fgBuffer, 0, fgData.Scan0, fgBytes);
                fg.UnlockBits(fgData);

                double scale = Math.Min((canvasWidth - (padding * 2.0)) / cropW, (canvasHeight - (padding * 2.0)) / cropH);
                int drawW = (int)Math.Round(cropW * scale);
                int drawH = (int)Math.Round(cropH * scale);
                int drawX = (int)Math.Round((canvasWidth - drawW) / 2.0);
                int drawY = (int)Math.Round((canvasHeight - drawH) / 2.0);

                Directory.CreateDirectory(Path.GetDirectoryName(Path.GetFullPath(outputPath)));
                using (var canvas = new Bitmap(canvasWidth, canvasHeight, PixelFormat.Format32bppArgb))
                using (var graphics = Graphics.FromImage(canvas))
                {
                    graphics.Clear(Color.FromArgb(0, 0, 0, 0));
                    graphics.InterpolationMode = InterpolationMode.HighQualityBicubic;
                    graphics.SmoothingMode = SmoothingMode.HighQuality;
                    graphics.PixelOffsetMode = PixelOffsetMode.HighQuality;
                    graphics.DrawImage(fg, drawX, drawY, drawW, drawH);
                    canvas.Save(outputPath, ImageFormat.Png);
                }
            }
        }
    }
}
"@

$resolvedInput = (Resolve-Path $InputPath).Path
$resolvedOutput = [System.IO.Path]::GetFullPath((Join-Path (Get-Location) $OutputPath))
[FiveAlphaExporter]::Export($resolvedInput, $resolvedOutput, $CanvasWidth, $CanvasHeight, $Padding)
