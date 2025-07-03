import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json' ,
    }),

    withCredentials: true,
    observe: 'response' as 'response'
  };
  constructor(private httpClient: HttpClient) {}

  get(url:string,options?: any){
    return this.httpClient.get(url, this.httpOptions);
  }

  put(url: string, data: any, options?: any){
    return this.httpClient.put(url, data, this.httpOptions);
  }

  post(url: string, data?: any, options?: any){
    return this.httpClient.post(url, data, this.httpOptions);
  }

  delete(url: string, data?: any){
    return this.httpClient.delete(url, data);
  }
}
