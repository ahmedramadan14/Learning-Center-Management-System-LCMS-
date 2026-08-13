import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { SecretariesComponent } from './secretaries.component';

describe('SecretariesComponent', () => {
  let component: SecretariesComponent;
  let fixture: ComponentFixture<SecretariesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SecretariesComponent],
      imports: [FormsModule]
    });
    fixture = TestBed.createComponent(SecretariesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
