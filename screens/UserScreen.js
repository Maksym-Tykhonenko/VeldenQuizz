import {
  Text,
  View,
  ImageBackground,
  SafeAreaView,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import {
  fetchUserData,
  submitUserDataInputs,
} from '../components/Utils/userUtils';
import {CustomInput, LayoutKeyboard, MyButton} from '../components/ui';
import {useState, useEffect} from 'react';
import UserDetails from '../components/UserScreenComponents/UserDetails';
import styles from '../components/UserScreenComponents/styles';
import {COLORS} from '../constants/colors';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useWindowDimensions} from 'react-native';

const setDateId = () => Date.now().toString();

const UserScreen = ({navigation}) => {
  const {height, width} = useWindowDimensions();
  const [selectAvatar, setSelectAvatar] = useState(null);
  const [prevName, setPrevName] = useState('');
  const [name, setName] = useState('');

  const AvatarPicer = () => {
    let options = {
      storageOptios: {
        path: 'image',
      },
    };

    launchImageLibrary(options, response => {
      if (!response.didCancel) {
        //console.log('response==>', response.assets[0].uri);
        setSelectAvatar(response.assets[0].uri);
      } else {
        console.log('Вибір скасовано');
      }
    });
  };

  const SaveName = () => {
    if (prevName !== '') {
      setName(prevName);
      setPrevName('');
    }
  };

  return (
    <View
      style={{
        position: 'relative',
        flex: 1,
        alignItems: 'center',
        backgroundColor: COLORS.mainTimber,
        paddingTop: 50,
      }}>
      <View style={{alignItems: 'center'}}>
        <View>
          {!selectAvatar ? (
            <TouchableOpacity
              onPress={() => {
                AvatarPicer();
              }}
              style={{
                width: 250,
                height: 250,
                borderWidth: 7,
                borderColor: COLORS.beige,
                borderRadius: 150,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#fff',
                shadowOpacity: 5,
                shadowRadius: 10,
                shadowOffset: {
                  width: 10,
                  height: 10,
                },
                elevation: 10,
                backgroundColor: 'rgba(0,0,0,0.1)',
              }}>
              <Text
                style={{
                  color: COLORS.beige,
                  fontSize: 40,
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}>
                Add photo
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => {
                AvatarPicer();
              }}
              style={{
                width: 250,
                height: 250,
                borderWidth: 7,
                borderColor: COLORS.beige,
                borderRadius: 150,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#fff',
                shadowOpacity: 5,
                shadowRadius: 10,
                shadowOffset: {
                  width: 10,
                  height: 10,
                },
                elevation: 10,
                backgroundColor: 'rgba(0,0,0,0.1)',
              }}>
              <Image
                style={{
                  width: 235,
                  height: 235,
                  color: '#fff',
                  borderRadius: 150,
                }}
                source={{uri: selectAvatar}}
              />
            </TouchableOpacity>
          )}
        </View>

        {!name ? (
          <View
            style={{
              marginTop: 30,
              alignItems: 'center',
              flexDirection: 'row',
            }}>
            <TextInput
              style={{
                height: 60,
                width: width * 0.75,
                borderColor: COLORS.beige,
                color: COLORS.beige,
                borderWidth: 3,
                borderRadius: 15,
                paddingHorizontal: 10,
                //marginTop: 10,
                marginBottom: 20,
                fontSize: 20,
                backgroundColor: 'rgba(0,0,0,0.4)',
              }}
              placeholder="Name..."
              placeholderTextColor="#999"
              onChangeText={setPrevName}
              value={prevName}
            />
            <TouchableOpacity
              onPress={() => {
                SaveName();
              }}
              style={{
                height: 60,
                width: 60,
                marginTop: -20,
                marginLeft: 5,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Image
                style={{width: 60, height: 60, color: COLORS.beige}}
                source={require('../assets/img/icons/ok.png')}
              />
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={{
              marginTop: 30,
              alignItems: 'center',
              flexDirection: 'row',
            }}>
            <Text
              style={{
                color: COLORS.beige,
                fontSize: 45,
                fontWeight: 'bold',
                shadowColor: '#fff',
                shadowOpacity: 5,
                shadowRadius: 10,
                shadowOffset: {
                  width: 10,
                  height: 10,
                },
                elevation: 10,
              }}>
              {name}
            </Text>
            <TouchableOpacity
              style={{
                marginTop: -30,
                shadowColor: '#fff',
                shadowOpacity: 5,
                shadowRadius: 10,
                shadowOffset: {
                  width: 10,
                  height: 10,
                },
                elevation: 10,
              }}
              onPress={() => {
                setName('');
              }}>
              <Image
                style={{width: 30, height: 30}}
                source={require('../assets/img/icons/redo77.png')}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <TouchableOpacity
        onPress={() => {
          navigation.goBack();
        }}
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          width: 60,
          height: 60,
          borderWidth: 2,
          borderRadius: 20,
          borderColor: COLORS.beige,
          backgroundColor: COLORS.beige,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text
          style={{color: COLORS.mainTimber, fontSize: 30, fontWeight: 'bold'}}>
          {'<'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  {
    /** 
  const [user, setUser] = useState(null);
  const [userInputs, setUserInputs] = useState({name: ''});
  console.log(userInputs);

  useEffect(() => {
    const fetchUser = async () => {
      const data = await fetchUserData();
      setUser(data);
    };
    fetchUser();
  }, []);

  const inputsSave = (identifier, newValue) => {
    setUserInputs(prev => ({...prev, [identifier]: newValue}));
  };

  const submit = async () => {
    const {name} = userInputs;
    if (!name.trim()) {
      Alert.alert('Oops', 'Name invalid');
      return;
    }

    const submitData = {userId: setDateId(), name};
    try {
      await submitUserDataInputs(submitData);
      const updatedData = await fetchUserData();
      setUser(updatedData);
    } catch (error) {
      console.error('Failed to submit user data:', error);
    }
  };

  const resetInputs = () => {
    setUserInputs({name: ''});
  };

  return (
    <View style={styles.rootContainer}>
      {user ? (
        <>
          <UserDetails user={user} />
        </>
      ) : (
        <LayoutKeyboard>
          <View
            style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <View>
              <CustomInput
                value={userInputs.name}
                onChangeText={value => inputsSave('name', value)}
                label="Nick Name"
                styleInput={{
                  padding: 10,
                  backgroundColor: COLORS.beige,
                  borderRadius: 20,
                  fontSize: 22,
                  width: 220,
                }}
                styleContainer={{marginVertical: 25}}
                styleText={{
                  marginBottom: 5,
                  fontSize: 22,
                  color: COLORS.beige,
                }}
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'space-between',
                gap: 20,
                marginTop: 30,
              }}>
              <MyButton
                positionStyle={{marginTop: 60}}
                onPressFn={submit}
                btnStyle={styles.btnStyle}>
                <Text
                  style={{fontSize: 26, fontWeight: '500', color: COLORS.iron}}>
                  Submit
                </Text>
              </MyButton>
              <MyButton
                btnStyle={styles.btnStyle}
                positionStyle={{marginVertical: 20}}
                onPressFn={resetInputs}>
                <Text
                  style={{fontSize: 26, fontWeight: '500', color: COLORS.iron}}>
                  Reset
                </Text>
              </MyButton>
            </View>
          </View>
        </LayoutKeyboard>
      )}
    </View>
  );*/
  }
};

export default UserScreen;
