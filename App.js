import React, { useState, useEffect } from 'react';
import { StyleSheet ,Text, View, Button, Image, Linking} from 'react-native';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import * as MediaLibrary from "expo-media-library";
import * as ImagePicker from 'expo-image-picker';

export default function App() {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [camera, setCamera] = useState(null);
  const [image, setImage] = useState(null);
  const [imageSave, setImageForSave] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [check, setCheck] = useState(null);

  useEffect(() => {
      (async () => {
        const cameraStatus = await Camera.requestCameraPermissionsAsync();
        setHasCameraPermission(cameraStatus.status === 'granted');

        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        } else {
          if (status.status === "granted") {
            // Your actually code require this permission
          }
          let location = await Location.getCurrentPositionAsync({});
          setLocation(location);
        }
      })();
    }, []);

  const takePicture = async () => {
    setCheck(false);
    setImage(false);
    if(camera){
        const data = await camera.takePictureAsync(null)
        setImage(data.uri);
        setImageForSave(data.uri);
    }
  }

  
  const savePicture = async (uri) => {
    try {
      // Request device storage access permission
      const file = uri.split('/').slice(0, -1).join('/');
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === "granted") {
      // Save image to media library

      // const fullfileName = uri.split('/').pop();
      // const fileType = fullfileName.split('.').pop();
      // const fileName = fullfileName.split('.').slice(0, -1).join('.');
      // uri = "";
      // uri = file+"/"+location.coords.latitude+"-"+location.coords.longitude+"."+fileType;
      // console.log(uri);

        await MediaLibrary.saveToLibraryAsync(uri);
        setCheck(true);
        alert("Image successfully saved");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.cancelled) {
      setCheck(true);
      setImage(result.uri);
      setImageForSave(result.uri);
    }
  };

  let text = 'Waiting..';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

  if (hasCameraPermission === false) {
    return <Text>No access to camera</Text>;
  }
  return (
   <View style={{ flex: 1}}>
      { !check &&
        <View style={styles.cameraContainer}>
                  <Camera 
                ref={ref => setCamera(ref)}
                style={styles.fixedRatio} 
                type={type}
                ratio={'1:1'} />
              
        </View>
      }   

      { location &&
        <Text style={styles.paragraph}>latitude : {location.coords.latitude}</Text>
      }

      { location &&
        <Text style={styles.paragraph}>longitude : {location.coords.longitude}</Text>
      }

      { !check && 
        <Button
            title="Flip Image"
            onPress={() => {
              setType(
                type === Camera.Constants.Type.back
                  ? Camera.Constants.Type.front
                  : Camera.Constants.Type.back
              );
            }}>
        </Button>
      } 

      { image &&
        <Text style={styles.paragraph}>Name Photo : {image}</Text>
      }
      
      <Button title="Take Picture" onPress={() => takePicture()} />
      <Button title="Save Picture" onPress={() => savePicture(imageSave)} />
      <Button title="Pick an image from camera roll" onPress={pickImage} />
      {image && <Image source={{uri: image}} style={{flex:1}}/>}
   </View>
  );
}
const styles = StyleSheet.create({
  cameraContainer: {
      flex: 1,
      flexDirection: 'row'
  },
  fixedRatio:{
      flex: 1,
      aspectRatio: 1
  }
})