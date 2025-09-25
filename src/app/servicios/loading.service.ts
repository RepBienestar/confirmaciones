// loading.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LoadingService {
    private loadingSubject = new Subject<boolean>();
    loading$ = this.loadingSubject.asObservable();

    setLoading(value: boolean) {
        setTimeout(() => {
            this.loadingSubject.next(value);
        });
    }
}