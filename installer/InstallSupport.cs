using System;using System.IO;using System.Runtime.InteropServices;using System.Runtime.InteropServices.ComTypes;using Microsoft.Web.WebView2.Core;
class InstallSupport {
 [StructLayout(LayoutKind.Sequential,Pack=4)]struct Key{public Guid fmtid;public uint pid;public Key(Guid g,uint p){fmtid=g;pid=p;}}
 [StructLayout(LayoutKind.Explicit,Size=24)]struct Value{[FieldOffset(0)]public ushort type;[FieldOffset(8)]public IntPtr text;}
 [ComImport,Guid("886D8EEB-8CF2-4446-8D02-CDBA1DBDCF99"),InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]interface Store{
  [PreserveSig]int GetCount(out uint count);[PreserveSig]int GetAt(uint index,out Key key);[PreserveSig]int GetValue(ref Key key,out Value value);[PreserveSig]int SetValue(ref Key key,ref Value value);[PreserveSig]int Commit();
 }
 [STAThread]static int Main(string[] args){try{if(args.Length==1&&args[0]=="--runtime"){return String.IsNullOrEmpty(CoreWebView2Environment.GetAvailableBrowserVersionString())?10:0;}if(args.Length==2&&args[0]=="--taglink"){object link=Activator.CreateInstance(Type.GetTypeFromCLSID(new Guid("00021401-0000-0000-C000-000000000046")));try{var file=(IPersistFile)link;file.Load(Path.GetFullPath(args[1]),2);var key=new Key(new Guid("9F4C2855-9F79-4B39-A8D0-E1D42DE1D5F3"),5);var value=new Value{type=31,text=Marshal.StringToCoTaskMemUni("YuriMusic.Desktop")};try{Marshal.ThrowExceptionForHR(((Store)link).SetValue(ref key,ref value));Marshal.ThrowExceptionForHR(((Store)link).Commit());file.Save(Path.GetFullPath(args[1]),true);}finally{Marshal.FreeCoTaskMem(value.text);}}finally{Marshal.FinalReleaseComObject(link);}return 0;}return 2;}catch(Exception e){Console.Error.WriteLine(e.GetType().Name+" "+e.HResult.ToString("X")+" "+e.Message);return 10;}}
}
