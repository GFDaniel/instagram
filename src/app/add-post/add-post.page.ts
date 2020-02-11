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
  selector: 'app-add-post',
  templateUrl: './add-post.page.html',
  styleUrls: ['./add-post.page.scss'],
})
export class AddPostPage implements OnInit {

  public uploadPercent: Observable<number>;
  public downloadUrl: Observable<string>;
  public description: string;
  public numbersPost: number;
  
  constructor(platform: Platform, androidPermissions: AndroidPermissions,
    private camera:Camera, private file:File, private angularFireStorage:AngularFireStorage,
    private navCtrl: NavController, public global:GlobalServiceService,
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
    firebase.database().ref("/users/"+firebase.auth().currentUser.uid).once("value").then((snap)=>{
      this.numbersPost=snap.child("numbersPost").val()
    })
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
    } catch(error) {
      console.error(error);
    }
  }

  uploadPicture(blob: Blob){
    
    const ref = this.angularFireStorage.ref(firebase.auth().currentUser.uid+'/'+this.numbersPost+'/'+'post.jpg');
    const task = ref.put(blob);
    
    this.uploadPercent = task.percentageChanges();
    task.snapshotChanges().pipe(
      finalize(() =>{
        this.downloadUrl = ref.getDownloadURL();
      })
    ).subscribe();
  }

  addPost(description){ 
    var post = {
      "description" : description
    }
    firebase.database().ref("/users/"+firebase.auth().currentUser.uid +"/post").child(this.numbersPost.toString()).set(post);
    firebase.database().ref("/users/"+firebase.auth().currentUser.uid).update({ numbersPost: this.numbersPost+1 });
    this.navCtrl.navigateRoot('/home');
    
  }

  

}
