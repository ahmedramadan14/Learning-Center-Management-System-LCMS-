import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecretariesComponent } from './secretaries.component';

describe('SecretariesComponent', () => {
  let component: SecretariesComponent;
  let fixture: ComponentFixture<SecretariesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SecretariesComponent]
    });
    fixture = TestBed.createComponent(SecretariesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
