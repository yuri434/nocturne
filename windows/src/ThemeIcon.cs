using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
static class ThemeIcon{
 public static Icon Create(string source,string color,out MemoryStream storage,bool recolorAll=false,bool original=false){
  var accent=ColorTranslator.FromHtml(color);var frames=new List<byte[]>();int[] sizes={16,24,32,48,64,256};
  using(var image=new Bitmap(source))using(var tinted=new Bitmap(image.Width,image.Height,PixelFormat.Format32bppArgb)){
   int maximum=1;for(int y=0;y<image.Height;y++)for(int x=0;x<image.Width;x++){var p=image.GetPixel(x,y);maximum=Math.Max(maximum,recolorAll?Math.Max(p.R,Math.Max(p.G,p.B)):p.G);}
   for(int y=0;y<image.Height;y++)for(int x=0;x<image.Width;x++){var pixel=image.GetPixel(x,y);if(!original&&y>image.Height*.62&&pixel.R>pixel.G*1.3&&pixel.R>pixel.B*1.2){double factor=(recolorAll?Math.Max(pixel.R,Math.Max(pixel.G,pixel.B)):pixel.G)/(double)maximum;pixel=Color.FromArgb(pixel.A,(int)(accent.R*factor),(int)(accent.G*factor),(int)(accent.B*factor));}tinted.SetPixel(x,y,pixel);}
   foreach(int size in sizes)using(var frame=new Bitmap(size,size,PixelFormat.Format32bppArgb))using(var graphics=Graphics.FromImage(frame))using(var encoded=new MemoryStream())using(var dib=new BinaryWriter(encoded,System.Text.Encoding.UTF8,true)){
    graphics.CompositingMode=CompositingMode.SourceCopy;graphics.InterpolationMode=InterpolationMode.HighQualityBicubic;graphics.PixelOffsetMode=PixelOffsetMode.Half;graphics.DrawImage(tinted,new Rectangle(0,0,size,size));graphics.Flush();
    dib.Write((uint)40);dib.Write(size);dib.Write(size*2);dib.Write((ushort)1);dib.Write((ushort)32);dib.Write((uint)0);dib.Write(size*size*4);dib.Write(0);dib.Write(0);dib.Write((uint)0);dib.Write((uint)0);
    for(int y=size-1;y>=0;y--)for(int x=0;x<size;x++){var pixel=frame.GetPixel(x,y);dib.Write(pixel.B);dib.Write(pixel.G);dib.Write(pixel.R);dib.Write(pixel.A);}
    int stride=((size+31)/32)*4;for(int y=size-1;y>=0;y--){var mask=new byte[stride];for(int x=0;x<size;x++)if(frame.GetPixel(x,y).A<128)mask[x/8]|=(byte)(0x80>>(x%8));dib.Write(mask);}dib.Flush();frames.Add(encoded.ToArray());
   }
  }
  storage=new MemoryStream();using(var writer=new BinaryWriter(storage,System.Text.Encoding.UTF8,true)){
   writer.Write((ushort)0);writer.Write((ushort)1);writer.Write((ushort)sizes.Length);int offset=6+16*sizes.Length;
   for(int i=0;i<sizes.Length;i++){writer.Write((byte)(sizes[i]==256?0:sizes[i]));writer.Write((byte)(sizes[i]==256?0:sizes[i]));writer.Write((byte)0);writer.Write((byte)0);writer.Write((ushort)1);writer.Write((ushort)32);writer.Write(frames[i].Length);writer.Write(offset);offset+=frames[i].Length;}
   foreach(byte[] frame in frames)writer.Write(frame);
  }
  storage.Position=0;try{return new Icon(storage,32,32);}catch{storage.Dispose();throw;}
 }
}
