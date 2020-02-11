import { Component, OnInit } from '@angular/core';
import { NavController, ModalController } from '@ionic/angular';
import { AuthenticationService } from '../services/authentication.service';
import { Platform } from '@ionic/angular';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { File } from '@ionic-native/file/ngx';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import * as firebase from 'firebase';
import { GlobalServiceService } from '../services/global-service.service';


@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
})
export class EditProfilePage implements OnInit {

  public uploadPercent: Observable<number>;
  public downloadUrl: Observable<string>;
  public photo: string;
  public name: string;
  public lastname: string;
  public description: string;
  public isUrl: boolean = true;
  public urlProfile: string = "";
  
  constructor(platform: Platform, androidPermissions: AndroidPermissions,
    private camera:Camera, private file:File, private angularFireStorage:AngularFireStorage,
    private navCtrl: NavController, private authService: AuthenticationService,
    public global:GlobalServiceService,
) {
    platform.ready().then(() => {
      androidPermissions.requestPermissions(
        [
          androidPermissions.PERMISSION.CAMERA, 
          androidPermissions.PERMISSION.CALL_PHONE, 
          androidPermissions.PERMISSION.GET_ACCOUNTS, 
          androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE, 
          androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE
        ]
      );
    }) 
  }

  ngOnInit(){
    this.name = this.global.getInfoName();
    this.lastname = this.global.getInfoLastname();
    this.description = this.global.getInfoDescription();
    if (this.global.getPhoto()!='null') {
      this.downloadUrl = this.angularFireStorage.ref(firebase.auth().currentUser.uid+'profile.jpg').getDownloadURL()
      this.photo = "nill"
    }else{
      this.downloadUrl = this.angularFireStorage.ref('profile2.jpg').getDownloadURL()
      this.photo = "null"
    }


  }

  async openGalery(){
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      correctOrientation: true
    };

    try{
      const fileUri: string = await this.camera.getPicture(options);
      let file: string;

      file = fileUri.substring(fileUri.lastIndexOf('/')+1, fileUri.indexOf('?'));
      const path: string = fileUri.substring(0, fileUri.lastIndexOf('/'));

      const buffer: ArrayBuffer = await this.file.readAsArrayBuffer(path, file);
      const blob: Blob = new Blob([buffer], {type: 'image/jpeg' });

      await this.uploadPicture(blob);
      firebase.database().ref("/users/"+firebase.auth().currentUser.uid).update({ photo: this.urlProfile });
    } catch(error) {
      console.error(error);
    }
  }

  uploadPicture(blob: Blob){
    const ref = this.angularFireStorage.ref(firebase.auth().currentUser.uid+'profile.jpg');
    const task = ref.put(blob);
    
    this.uploadPercent = task.percentageChanges();
    task.snapshotChanges().pipe(
      finalize(() =>{
        this.downloadUrl = ref.getDownloadURL()
        this.urlProfile = "null"
      })
    ).subscribe();
  }

  saveUser(name, lastname, description){
    var Uid = firebase.auth().currentUser.uid
    firebase.database().ref("/users/"+Uid).update({ name : name, lastname : lastname, description: description });
    this.navCtrl.navigateRoot('/home');
    
  }

}
