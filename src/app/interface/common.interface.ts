import { HttpErrorResponse } from "@angular/common/http";

export interface IResponse {
    data: Object;
    message: string;
}

export interface IErrorResponse{
  error:HttpErrorResponse,
}
