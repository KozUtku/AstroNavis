import { Component } from '@angular/core';
import { NasaService } from '../../data/services/nasa.service';
import { tap, catchError, of, finalize } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nasa-gallery',
  templateUrl: './nasa-gallery.component.html',
  styleUrls: ['./nasa-gallery.component.css'],
  imports:[CommonModule]
})
export class NasaGalleryComponent {
  photo: any = null;
  isLoading = false;
  errorMessage: string | null = null;
  maxDate: string = '';
  minDate: string = '1995-06-16';

  constructor(private nasaService: NasaService) {}

  ngOnInit(): void {
    this.setMaxDate();
  }

  setMaxDate(): void {
    this.maxDate = new Date().toISOString().split('T')[0];
  }

  onDateChange(event: Event): void {
    const selectedDate = (event.target as HTMLInputElement).value;
    if (this.isValidDate(selectedDate)) {
      this.fetchPhoto(selectedDate);
    }
  }

  isValidDate(selectedDate: string): boolean {
    const today = new Date();
    const selected = new Date(selectedDate);

    if (selected > today) {
      this.errorMessage = 'Bugünden sonraki bir tarih seçemezsiniz.';
      return false;
    }
    return true;
  }

  fetchPhoto(date: string): void {
    this.setLoadingState(true);

    this.nasaService.getPhotoByDate(date).pipe(
      tap((data) => {
        console.log('Tam Açıklama (Çevrilmiş):', data.explanation);
        this.photo = data;
      }),
      catchError((error) => {
        console.error('API Hatası:', error);
        this.errorMessage = error.status === 404
          ? 'Bu tarihe ait bir fotoğraf bulunamadı.'
          : 'Bir hata oluştu. Lütfen tekrar deneyin.';
        return of(null);
      }),
      finalize(() => this.setLoadingState(false))
    ).subscribe();
  }

  setLoadingState(isLoading: boolean): void {
    this.isLoading = isLoading;
    if (isLoading) {
      this.errorMessage = null;
      this.photo = null;
    }
  }
}
