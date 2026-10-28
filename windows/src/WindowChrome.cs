using System;using System.Drawing;using System.Runtime.InteropServices;using System.Windows.Forms;
partial class Desktop{
 [DllImport("user32.dll")]static extern bool ReleaseCapture();
 [DllImport("user32.dll")]static extern IntPtr SendMessage(IntPtr h,int message,IntPtr w,IntPtr l);
 [StructLayout(LayoutKind.Sequential)]struct ChromePoint{public int X,Y;}
 [StructLayout(LayoutKind.Sequential)]struct ChromeMinMax{public ChromePoint Reserved,MaxSize,MaxPosition,MinTrackSize,MaxTrackSize;}
 bool chromeCloseReady;
 protected override CreateParams CreateParams{get{var cp=base.CreateParams;cp.Style|=0x00040000|0x00020000|0x00010000|0x00080000;return cp;}}
 bool HandleChromeMessage(ref Message m){
  if(m.Msg==0x83&&m.WParam!=IntPtr.Zero){m.Result=IntPtr.Zero;return true;}
  if(m.Msg==0x24){var value=(ChromeMinMax)Marshal.PtrToStructure(m.LParam,typeof(ChromeMinMax));var screen=Screen.FromHandle(Handle);var area=screen.WorkingArea;value.MaxPosition.X=area.Left-screen.Bounds.Left;value.MaxPosition.Y=area.Top-screen.Bounds.Top;value.MaxSize.X=area.Width;value.MaxSize.Y=area.Height;value.MinTrackSize.X=MinimumSize.Width;value.MinTrackSize.Y=MinimumSize.Height;Marshal.StructureToPtr(value,m.LParam,false);m.Result=IntPtr.Zero;return true;}return false;
 }
 object ChromeCommand(string action){
  if(action=="close"){BeginInvoke(new Action(Close));return WindowMode();}
  if(action=="minimize")WindowState=FormWindowState.Minimized;
  else if(action=="maximize"){if(mini)SetMini(false,true);else WindowState=WindowState==FormWindowState.Maximized?FormWindowState.Normal:FormWindowState.Maximized;}
  else if(action=="drag"){if(WindowState==FormWindowState.Maximized){var ratio=(Cursor.Position.X-Left)/(double)Math.Max(1,Width);WindowState=FormWindowState.Normal;Location=new Point(Cursor.Position.X-(int)(Width*ratio),Cursor.Position.Y-20);}ReleaseCapture();SendMessage(Handle,0xa1,new IntPtr(2),IntPtr.Zero);}
  else if(action.StartsWith("resize-")&&WindowState==FormWindowState.Normal){string[] names={"left","right","top","top-left","top-right","bottom","bottom-left","bottom-right"};int i=Array.IndexOf(names,action.Substring(7));if(i>=0){ReleaseCapture();SendMessage(Handle,0xa1,new IntPtr(10+i),IntPtr.Zero);}}
  return WindowMode();
 }
 protected override async void OnFormClosing(FormClosingEventArgs e){
  if(!chromeCloseReady&&!closing&&view.CoreWebView2!=null){e.Cancel=true;base.OnFormClosing(e);chromeCloseReady=true;try{string encoded=await view.ExecuteScriptAsync("JSON.stringify(window.yuriPlaybackSnapshot?window.yuriPlaybackSnapshot():null)");string data=json.Deserialize<string>(encoded);if(!String.IsNullOrEmpty(data)&&data!="null"&&data.Length<2*1024*1024)AtomicWrite(System.IO.Path.Combine(root,"playback.json"),data);}catch{}BeginInvoke(new Action(Close));return;}base.OnFormClosing(e);
 }
}
