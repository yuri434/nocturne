using System;using System.Diagnostics;using System.IO;using System.Windows.Forms;using System.Reflection;
[assembly:AssemblyTitle("Noctune")][assembly:AssemblyProduct("Noctune")]
class NoctuneLauncher{[STAThread]static void Main(){string file=Path.Combine(AppDomain.CurrentDomain.BaseDirectory,"YuriMusic-YouTube.exe");if(!File.Exists(file)){MessageBox.Show("Extraia o ZIP inteiro antes de abrir o Noctune.");return;}Process.Start(new ProcessStartInfo(file){WorkingDirectory=AppDomain.CurrentDomain.BaseDirectory,UseShellExecute=false});}}
