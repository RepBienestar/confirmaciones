import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'datosPipes'
})
export class DatosPipesPipe implements PipeTransform {

  transform(value:any) {
    let res: string = "";
    
    if (value.includes('pdf')) {
      res = "PDF";
    }else if (value.includes('jpeg')) {
      res = "JPEG";
    }
    else if (value.includes('png')) {
      res = "PNG";
    }
    else if (value.includes('jpg')) {
      res = "JPG";
    }
    else {
      res = value;
    }
    return res;
  }

}