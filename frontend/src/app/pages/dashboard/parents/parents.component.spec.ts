import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';

import { ParentsComponent } from './parents.component';

describe('ParentsComponent', () => {
  let component: ParentsComponent;
  let fixture: ComponentFixture<ParentsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ParentsComponent],
      imports: [FormsModule, HttpClientTestingModule]
    });
    fixture = TestBed.createComponent(ParentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
