import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { auto } from '@popperjs/core';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  constructor(private _formBuilder: FormBuilder) {}

  public title = 'sistema-sorteos';
  public titulo: any;
  public numBeneficiarios: number = 0;
  public valoresSorteo: any[] = [];
  public valorGanadores: any[] = [];
  public mostrarResultados: boolean = false;
  public mostrarGif: boolean = false;
  private valuesTable: any[] = [];
  pageActual: number = 1;
  private nombreArchivoExel: string = 'Restantes.xlsx';

  firstFormGroup = this._formBuilder.group({
    inpTituloSorteo: ['', Validators.required],
    inpNumeroBeneficiarios: ['', Validators.required],
    inpValoresSorteo: ['', Validators.required],
  });
  ngOnInit(): void {}

  sortear() {
    this.valorGanadores = [];
    this.valuesTable = [];
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

          // Borrando ganadores del array de valores
          for (let i = 0; i < this.valorGanadores.length; i++) {
            for (let j = 0; j < this.valoresSorteo.length; j++) {
              if (this.valoresSorteo[j] === this.valorGanadores[i]) {
                this.valoresSorteo.splice(j, 1);
              }
            }
          }
          for (let i = 0; i < this.valorGanadores.length; i++) {
            this.valuesTable.push([(i + 1).toString(), this.valorGanadores[i]]);
          }
          console.log('Valores restantes', this.valoresSorteo);
        }, 5000);
      }
    }
  }

  async createPDF() {
    const pdfDefinition: any = {
      pageMargins: [40, 210, 40, 60],
      header: [
        {
          image: await this.getBase64ImageFromURL(
            '../../assets/img/LogoMunicipioColor.svg'
          ),
          width: 400,
          alignment: 'center',
          margin: [0, 4, 0, 0],
        },
        {
          text: 'Administración General\n',
          style: 'header',
          alignment: 'center',
        },
        {
          text: 'DIRECCIÓN METROPOLITANA DE RECURSOS HUMANOS\n\n',
          style: 'header',
          alignment: 'center',
        },
        {
          text: 'PROCESO DE SELECCIÓN Y CONTRATACIÓN DE PERSONAL BAJO LA MODALIDAD DEL CÓDIGO DEL TRABAJO \n\n',
          style: 'subheader',
          alignment: 'center',
          margin: [15, 0],
        },
        {
          text: `${this.titulo}\n\n`,
          style: 'subheader',
          alignment: 'center',
        },
      ],
      content: [
        'Listado de ganadores: \n\n',
        {
          columns: [
            { width: '*', text: '' },
            {
              width: 'auto',
              table: {
                body: [['N°', 'Nombre'], ...this.valuesTable],
                aligment: 'center',
              },
            },
            { width: '*', text: '' },
          ],
        },
      ],
      footer: function (currentPage, pageCount) {
        return [
          {
            text: 'Página ' + currentPage.toString() + ' de ' + pageCount,
            margin: [0, 0, 20, 0],
            alignment: 'right',
          },
        ];
      },
    };

    const pdf = pdfMake.createPdf(pdfDefinition);
    pdf.open();
  }

  nuevoSorteo() {
    this.mostrarResultados = false;
    this.firstFormGroup.reset();
  }

  getBase64ImageFromURL(url) {
    return new Promise((resolve, reject) => {
      var img = new Image();
      img.setAttribute('crossOrigin', 'anonymous');

      img.onload = () => {
        var canvas = document.createElement('canvas');
        canvas.width = img.width * 3;
        canvas.height = img.height * 3;

        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        var dataURL = canvas.toDataURL('image/png');

        resolve(dataURL);
      };

      img.onerror = (error) => {
        reject(error);
      };

      img.src = url;
    });
  }

  exportToExcel(): void {
    let element = document.getElementById('season-tble');
    const worksheet: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

    const book: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, worksheet, 'Sheet1');

    XLSX.writeFile(book, this.nombreArchivoExel);
  }
}
