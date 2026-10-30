using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
sealed class AudioProxy:IDisposable{
 readonly TcpListener server=new TcpListener(IPAddress.Loopback,0);
 readonly Dictionary<string,string> urls=new Dictionary<string,string>();readonly Queue<string> order=new Queue<string>();readonly SemaphoreSlim slots=new SemaphoreSlim(8,8);readonly CancellationTokenSource cancel=new CancellationTokenSource();
 readonly HttpClient http=new HttpClient(new HttpClientHandler{AllowAutoRedirect=false}){Timeout=TimeSpan.FromMinutes(20)};
 public AudioProxy(){server.Start();var ignored=Loop();}
 public string Add(string url){Uri parsed;if(!Uri.TryCreate(url,UriKind.Absolute,out parsed)||parsed.Scheme!="https"||!parsed.Host.EndsWith(".googlevideo.com"))throw new Exception("Endereço de áudio inválido.");string key=Guid.NewGuid().ToString("N");lock(urls){urls[key]=url;order.Enqueue(key);while(order.Count>12)urls.Remove(order.Dequeue());}return "http://127.0.0.1:"+((IPEndPoint)server.LocalEndpoint).Port+"/"+key;}
 async Task Loop(){while(!cancel.IsCancellationRequested){try{var client=await server.AcceptTcpClientAsync();if(!slots.Wait(0)){client.Close();continue;}var ignored=Serve(client);}catch{break;}}}
 async Task Serve(TcpClient client){try{using(client)using(var socket=client.GetStream())using(var reader=new StreamReader(socket,Encoding.ASCII,false,8192,true)){
 var lineTask=reader.ReadLineAsync();if(await Task.WhenAny(lineTask,Task.Delay(10000,cancel.Token))!=lineTask)return;string first=await lineTask;if(first==null||first.Length>1024)return;string[] parts=first.Split(' ');if(parts.Length!=3||!(parts[0]=="GET"||parts[0]=="HEAD"||parts[0]=="OPTIONS"))return;string key=parts[1].TrimStart('/'),url;lock(urls)if(!urls.TryGetValue(key,out url))return;
 string range=null,origin=null;int total=0;while(true){var next=reader.ReadLineAsync();if(await Task.WhenAny(next,Task.Delay(5000,cancel.Token))!=next)return;string line=await next;if(String.IsNullOrEmpty(line))break;total+=line.Length;if(total>16384)return;int colon=line.IndexOf(':');if(colon<1)return;string name=line.Substring(0,colon).ToLowerInvariant(),value=line.Substring(colon+1).Trim();if(name=="range")range=value;if(name=="origin")origin=value;}
 if(origin!=null&&origin!="https://yuri.local"){Log("Rejected origin "+origin);return;}string cors="Access-Control-Allow-Origin: https://yuri.local\r\nAccess-Control-Allow-Headers: Range\r\nAccess-Control-Allow-Methods: GET, HEAD, OPTIONS\r\nAccess-Control-Expose-Headers: Content-Range, Accept-Ranges, Content-Length\r\n";
 if(parts[0]=="OPTIONS"){await Header(socket,"204 No Content",cors+"Content-Length: 0\r\n");return;}
 using(var request=new HttpRequestMessage(parts[0]=="HEAD"?HttpMethod.Head:HttpMethod.Get,url)){if(range!=null&&System.Text.RegularExpressions.Regex.IsMatch(range,@"^bytes=\d*-\d*$"))request.Headers.TryAddWithoutValidation("Range",range);
 using(var response=await http.SendAsync(request,HttpCompletionOption.ResponseHeadersRead,cancel.Token)){
 Log("Upstream "+(int)response.StatusCode+"; "+response.Content.Headers.ContentType);if(!(response.IsSuccessStatusCode)){await Header(socket,"502 Bad Gateway",cors+"Content-Length: 0\r\n");return;}string headers=cors+"Content-Type: "+(response.Content.Headers.ContentType==null?"audio/mp4":response.Content.Headers.ContentType.ToString())+"\r\nAccept-Ranges: bytes\r\nCache-Control: no-store\r\n";
 if(response.Content.Headers.ContentLength.HasValue)headers+="Content-Length: "+response.Content.Headers.ContentLength.Value+"\r\n";if(response.Content.Headers.ContentRange!=null)headers+="Content-Range: "+response.Content.Headers.ContentRange+"\r\n";await Header(socket,((int)response.StatusCode)+" "+response.ReasonPhrase,headers);if(parts[0]!="HEAD")using(var source=await response.Content.ReadAsStreamAsync())await source.CopyToAsync(socket,32768,cancel.Token);
 }}
 }}catch(Exception error){Log(error.GetType().Name+": "+error.Message);}finally{slots.Release();}}
 static void Log(string text){string path=Environment.GetEnvironmentVariable("YURI_YT_TEST_REPORT");if(!String.IsNullOrEmpty(path))try{File.AppendAllText(path+".network.txt",text+Environment.NewLine);}catch{}}
 static async Task Header(Stream socket,string status,string headers){byte[] data=Encoding.ASCII.GetBytes("HTTP/1.1 "+status+"\r\nConnection: close\r\n"+headers+"\r\n");await socket.WriteAsync(data,0,data.Length);}
 public void Dispose(){cancel.Cancel();server.Stop();http.Dispose();}
}
