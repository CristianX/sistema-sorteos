import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  constructor(private _formBuilder: FormBuilder) {}

  public titulo: any;
  public numBeneficiarios: number = 0;
  private valoresSorteo: any[] = [];
  public valorGanadores: any[] = [];
  public mostrarResultados: boolean = false;
  public mostrarGif: boolean = false;

  firstFormGroup = this._formBuilder.group({
    inpTituloSorteo: ['', Validators.required],
    inpNumeroBeneficiarios: ['', Validators.required],
    inpValoresSorteo: ['', Validators.required],
  });
  ngOnInit(): void {}

  sortear() {
    this.valorGanadores = [];
    if (this.firstFormGroup.invalid) {
      Swal.fire({
        position: 'top-end',
        icon: 'error',
        title: 'Debe llenar todos los campos',
        showConfirmButton: false,
        timer: 1500,
      });
    } else {
      this.titulo = this.firstFormGroup.value.inpTituloSorteo;
      console.log('Titulo: ', this.titulo);

      this.numBeneficiarios = this.firstFormGroup.value.inpNumeroBeneficiarios;
      console.log('Numero de beneficiarios: ', this.numBeneficiarios);

      this.valoresSorteo =
        this.firstFormGroup.value.inpValoresSorteo.split('\n');

      if (this.numBeneficiarios > this.valoresSorteo.length - 1) {
        Swal.fire({
          position: 'top-end',
          icon: 'error',
          title:
            'El valor del número de beneficiarios no puede ser mayor al numero de valores del sorteo',
          showConfirmButton: false,
          timer: 3000,
        });
      } else {
        this.mostrarGif = true;
        setTimeout(() => {
          const n = this.valoresSorteo.length - 1;
          const arr = new Array(n);
          for (let i = 0; i < n; i++) {
            arr[i] = i + 1;
          }
          arr.sort(() => (Math.random() > 0.5 ? 1 : -1));

          const loteria = arr.slice(0, this.numBeneficiarios);
          console.log('Valores loretia', loteria);

          for (let index = 0; index < loteria.length; index++) {
            this.valorGanadores.push(this.valoresSorteo[loteria[index]]);
          }

          console.log('Valores Ganadores', this.valorGanadores);
          this.mostrarResultados = true;
          this.mostrarGif = false;
        }, 5000);
      }
    }
  }

  nuevoSorteo() {
    this.mostrarResultados = false;
    this.firstFormGroup.reset();
  }
}
