import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators ,AbstractControl, FormControl} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { VirtualTimeScheduler } from 'rxjs';
import { IrrigationPlan } from 'src/app/models/IrrigationPlan.model';
import { NomSolution } from 'src/app/models/NomSolution.model';
import { PesticidePlan } from 'src/app/models/PesticidePlan.model';
import { Plante } from 'src/app/models/Plante.model';
import { ProgrammeIrrigation } from 'src/app/models/ProgrammeIrrigation.model';
import { Ville } from 'src/app/models/ville.model';
import { IrrigationPlanService } from 'src/app/services/IrrigationPlan/irrigation-plan.service';
import { NomSolutionService } from 'src/app/services/NomSolution/nom-solution.service';
import { PesticidePlanService } from 'src/app/services/PesticidePlan/pesticide-plan.service';
import { PlanteService } from 'src/app/services/Plante/plante.service';
import { ProgrammeIrrigationService } from 'src/app/services/ProgrammeIrrigation/programme-irrigation.service';
import { VillesService } from 'src/app/services/villes/villes.service';
import Swal from 'sweetalert2';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { tick } from '@angular/core/testing';
import { AuthService } from 'src/app/services/auth/auth.service';


@Component({
  selector: 'app-details-programme',
  templateUrl: './details-programme.component.html',
  styleUrls: ['./details-programme.component.css']
})
export class DetailsProgrammeComponent implements OnInit {

  addIrrigationVisible:boolean=false;
  addPesticideVisible:boolean=false;
  programme:ProgrammeIrrigation= new ProgrammeIrrigation();
  id!:number;
  myForm!: FormGroup;
  PesticideForm!: FormGroup;
  IrrigationForm!: FormGroup;
  newPlanPesticide:PesticidePlan=new PesticidePlan();
  newPlanIrrigation:IrrigationPlan=new IrrigationPlan();
  nomsSolutions:NomSolution[]=[]
  villes:Ville[]=[];
  plantes:Plante[]=[];
  myImage:any = "assets/img/plant.png";
  constructor(private programmesIrrigationService: ProgrammeIrrigationService,
    private irrigationPlanService :IrrigationPlanService,
    private pesticidePlanService:PesticidePlanService,
    private nomSolutionService:NomSolutionService,
    private activatedRoute: ActivatedRoute,
    private planteService :PlanteService,
    private villeService:VillesService,
    private router:Router,
    private formBuilder: FormBuilder,
    public authService:AuthService
  ) { 
    this.myForm = this.formBuilder.group({
    
      nom: ['', [Validators.required]],
      
      dateDebut: ['', [Validators.required]],
      dateFin: ['', [Validators.required,this.dateFinValidator]],
      ville: ['', [Validators.required,this.validateVille.bind(this)]],
      plante: ['', [Validators.required,this.validatePlante.bind(this)]],
    });
      

    this.PesticideForm = this.formBuilder.group({
        
      dose: ['', [Validators.required]],
      frequence: ['', [Validators.required]],
      Nbfois	: ['', [Validators.required,Validators.pattern("^[0-9]*$")]],
      nomSolution: ['', [Validators.required,this.validateNomSolution.bind(this)]],
      });

      this.IrrigationForm = this.formBuilder.group({
        //numeric
        frequenceIrrigation: ['', [Validators.required,Validators.pattern("^[0-9]*$")]],
        
        unitefrequenceIrrigation: ['', [Validators.required]],
        dureeIrrigation: ['', [Validators.required,Validators.pattern("^[0-9]*$")]],
        uniteDureeIrrigation: ['', [Validators.required]],
        heure: ['', [Validators.required]],
        });



  }

  ngOnInit(): void {
  
   
    this.id = this.activatedRoute.snapshot.params['id'];
    this.getProgrammeIrrigationById();
    this.getNomSolution();
    this.getPlantes();
    this.getVilles();
    

    
  }
  config: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '10rem',
    minHeight: '5rem',
    placeholder: 'Enter text in this rich text editor....',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'Arial',
    customClasses: [
      {
        name: 'Quote',
        class: 'quoteClass',
      },
      {
        name: 'Title Heading',
        class: 'titleHead',
        tag: 'h1',
      },
      {
        name: 'Text Color',
        class: 'textColorClass',
        tag: 'span',
      },
      {
        name: 'Background Color',
        class: 'backgroundColorClass',
        tag: 'span',
      },
    ],
    toolbarHiddenButtons: [
      ['strikeThrough', 'subscript', 'superscript', 'link', 'unlink', 'insertImage', 'insertVideo', 'insertHorizontalRule', 'removeFormat', 'toggleEditorMode'],
    ],
  };
  
modifierProgramme(){
  if(this.myForm.valid){
  this.programmesIrrigationService.updateProgrammeIrrigation(this.programme).subscribe(
    (data)=>{
      this.programme=data;
      this.getPlanteById(this.programme.planteId);
      Swal.fire(
        'Programme modifié avec succés!',
        '',
        'success'
      )
      
    }
  )}else{
    // afficher l'erreur
    Swal.fire(
      'vérifier les champs!',
      '',
      'error'
    )
  }
}

  
  selectVille(id:number){
    this.programme.villeId=id;
  }

  selectPlante(id:number){
    this.programme.planteId=id;
  }

  selectSolution(id:number){
    this.newPlanPesticide.nomSolutionId=id;
  }


  getPlantes(){
    this.planteService.getAllPlantes().subscribe((data)=>{
      this.plantes=data;
    })
  }

  getVilles(){
    this.villeService.getAllVilles().subscribe((data)=>{
      this.villes=data;
    })
  }
ajouterPlanIrrigation(){
  this.newPlanIrrigation.programmeIrrigationId=this.id;
  this.irrigationPlanService.ajouterIrrigationPlan(this.newPlanIrrigation).subscribe(
    (data)=>{
      this.getProgrammeIrrigationById();
      this.hideAddIrrigation();
    }
  )
}

ajouterPlanPesticide(){
  this.newPlanPesticide.programmeIrrigationId=this.id;
  this.pesticidePlanService.ajouterPesticidePlan(this.newPlanPesticide).subscribe(
    (data)=>{
      this.getProgrammeIrrigationById();
      this.hideAddPesticide();
    }
  )
}

dateFinValidator(control: AbstractControl): { [key: string]: boolean } | null {
  const dateDebutValue = control.root.get('dateDebut')?.value
  const dateFinValue = control.value

  // Check if dateFin is after dateDebut
  if ( dateDebutValue > dateFinValue ) {
    return { 'dateFinBeforeDebut': true };
  }

  return null; // Return null if validation passes
}
  getProgrammeIrrigationById(){
    this.programmesIrrigationService.getProgrammeIrrigationById(this.id).subscribe(
      (programme)=>{
        this.programme=programme;
        this.getPlanteById(this.programme.planteId);
      }
    )
  }


  deletePlanIrrigation(id:number){
  
    Swal.fire({
      title:"Etes vous sur de vouloir supprimer ce plan ?"
      ,
      showCancelButton:true,
      confirmButtonText:"Oui, supprimer",
      cancelButtonText:"Annuler"
    }).then(
      (result)=>{
        if(result.isConfirmed){
          this.irrigationPlanService.deleteIrrigationPlan(id).subscribe(
            ()=>{
              this.getProgrammeIrrigationById();
            }
          )
        }
      }
    )
    }

    


   
  


  deletePlanPesticide(id:number){
    Swal.fire({
      title:"Etes vous sur de vouloir supprimer ce plan ?"
      ,
      showCancelButton:true,
      confirmButtonText:"Oui, supprimer",
      cancelButtonText:"Annuler"
    }).then(
      (result)=>{
        if(result.isConfirmed){
    this.pesticidePlanService.deletePesticidePlan(id).subscribe(
      (data)=>{
        this.getProgrammeIrrigationById();
      }
    )

}
      }
    )

  }


  deleteProgramme(){
    Swal.fire({
       title: 'Etes vous sur de vouloir supprimer ce programme ?',
       showCancelButton: true,
       confirmButtonText: `Supprimer`,
       cancelButtonText: `Annuler`,
     }).then((result) => {
       /* Read more about isConfirmed, isDenied below */
       if (result.isConfirmed) {
        this.programmesIrrigationService.deleteProgrammeIrrigation(this.id).subscribe(
          (data)=>{
            console.log(data);
            Swal.fire('Programme supprimé!', '', 'success')
            this.router.navigate(['/listeDesProgrammes']);
          },
          (error)=>{
            if (error.status==400){
              Swal.fire('Erreur!',error.error.message, 'error')
            }
          }
        )
       
      } 
     })
 
   }



   getNomSolution(){
    this.nomSolutionService.getAllNomSolutions().subscribe(
      (data)=>{
        this.nomsSolutions=data;
      }
    )
   }


   showAddIrrigation(){
    //set all items edit to false
    this.programme.listeDesIrrigationPlans.forEach((element: any) => {
      element.isEdit = false;
    });
    this.getProgrammeIrrigationById();
    this.IrrigationForm.reset();
    this.newPlanIrrigation=new IrrigationPlan();
    this.addIrrigationVisible=true
   }

   hideAddIrrigation(){
    this.addIrrigationVisible=false
   }

   showAddPesticide(){
    //set all items edit to false
    this.programme.listeDesPesticidePlans.forEach((element: any) => {
      element.isEdit = false;
    });
    
    //reset errors whithout reseting the form
    this.PesticideForm.markAsUntouched();

    this.getProgrammeIrrigationById();
  
    this.newPlanPesticide=new PesticidePlan();
    this.addPesticideVisible=true
   }

   hideAddPesticide(){
    this.addPesticideVisible=false
   }

   getPlanteById(id:number){
    this.planteService.getPlanteById(id).subscribe(
      (plante)=>{
        
        if(plante.image!=null){
          this.myImage = 'data:image/png;base64,'+plante.image;
        }
      }
    )
  }


  onEdit(item: any) {
    this.hideAddIrrigation();
    //set all elements of the array to false
    this.programme.listeDesIrrigationPlans.forEach((element: any) => {
      element.isEdit = false;
    });
    item.isEdit=true;
  }
  onEditPesticide(item:any){
        //set all elements of the array to false
        this.hideAddPesticide();    

    this.programme.listeDesPesticidePlans.forEach((element: any) => {
      element.isEdit = false;
    });


    

    item.isEdit=true;
  }

  setNonEdit(item: any) {
    //reset item to its original value
       item.isEdit=false;

    this.getProgrammeIrrigationById();

  }

  modifierPlanIrrigation(item:any){
    this.irrigationPlanService.updateIrrigationPlan(item).subscribe(
      (data)=>{
        this.getProgrammeIrrigationById();
      }
    )
  }


  modifierPlanPesticide(item:any){
    console.log(this.PesticideForm);
    this.pesticidePlanService.updatePesticidePlan(item).subscribe(
      (data)=>{
        this.getProgrammeIrrigationById();
      }
    )
  }


  validateNomSolution(control: FormControl): { [key: string]: any } | null {
    const selectedNomSolution = control.value;
    
    const isNomSolutionValid = selectedNomSolution.id > 0;
    return isNomSolutionValid ? null : { invalidNomSolution: true };
  }

  validateVille(control: AbstractControl): { [key: string]: any } | null {
    const selectedVille = control.value;
    const isVilleValid =selectedVille.id > 0;
    return isVilleValid ? null : { invalidVille: true };
  }  

  validatePlante(control: AbstractControl): { [key: string]: any } | null {
    const selectedPlante = control.value;
    const isPlanteValid = selectedPlante.id > 0 ;
    return isPlanteValid ? null : { invalidPlante: true };
  }


}
