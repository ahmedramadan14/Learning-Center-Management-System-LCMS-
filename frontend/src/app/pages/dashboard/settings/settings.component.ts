
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  // =========================================================
  // Settings
  // =========================================================

  isDarkMode: boolean = false;

  selectedLanguage: string = 'en';


  // =========================================================
  // Lifecycle
  // =========================================================

  ngOnInit(): void {

    this.loadSettings();

  }


  // =========================================================
  // Load Settings
  // =========================================================

  loadSettings(): void {

    const savedTheme =
      localStorage.getItem('theme');

    this.isDarkMode =
      savedTheme === 'dark';


    const savedLanguage =
      localStorage.getItem('language');

    if (
      savedLanguage === 'ar' ||
      savedLanguage === 'en'
    ) {

      this.selectedLanguage =
        savedLanguage;

    } else {

      this.selectedLanguage = 'en';

    }


    this.applyTheme();

    this.applyLanguage();

  }


  // =========================================================
  // Toggle Dark Mode
  // =========================================================

  toggleDarkMode(): void {

    this.applyTheme();

  }


  // =========================================================
  // Apply Theme
  // =========================================================

  applyTheme(): void {

    const body =
      document.body;


    if (this.isDarkMode) {

      body.classList.add('dark-mode');

      localStorage.setItem(
        'theme',
        'dark'
      );

    } else {

      body.classList.remove('dark-mode');

      localStorage.setItem(
        'theme',
        'light'
      );

    }

  }


  // =========================================================
  // Change Language
  // =========================================================

  changeLanguage(): void {

    localStorage.setItem(
      'language',
      this.selectedLanguage
    );


    this.applyLanguage();

  }


  // =========================================================
  // Apply Language
  // =========================================================

  applyLanguage(): void {

    const html =
      document.documentElement;


    if (this.selectedLanguage === 'ar') {

      html.setAttribute(
        'lang',
        'ar'
      );

      html.setAttribute(
        'dir',
        'rtl'
      );

    } else {

      html.setAttribute(
        'lang',
        'en'
      );

      html.setAttribute(
        'dir',
        'ltr'
      );

    }

  }

}

