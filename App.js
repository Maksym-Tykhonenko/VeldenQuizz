import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import {QuizzProvider} from './store/quizz_context';
import {
  GameScreen,
  MainScreen,
  QuizzLevelScreen,
  QuotesScreen,
  RulesScreen,
  UserScreen,
} from './screens';
import VeldenQuizzProdactScreen from './screens/VeldenQuizzProdactScreen';
import {useRef, useState, useEffect} from 'react';
import {Animated, View} from 'react-native';
import ReactNativeIdfaAaid, {
  AdvertisingInfoResponse,
} from '@sparkfabrik/react-native-idfa-aaid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import appsFlyer from 'react-native-appsflyer';
import {LogLevel, OneSignal} from 'react-native-onesignal';

const Stack = createNativeStackNavigator();

const App = () => {
  const [route, setRoute] = useState();
  const [idfa, setIdfa] = useState();
  console.log('idfa==>', idfa);
  const [appsUid, setAppsUid] = useState(null);
  const [sab1, setSab1] = useState();
  const [pid, setPid] = useState();

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    setData();
  }, [idfa, appsUid, sab1, pid]);

  const setData = async () => {
    try {
      const data = {
        idfa,
        appsUid,
        sab1,
        pid,
      };
      const jsonData = JSON.stringify(data);
      await AsyncStorage.setItem('App', jsonData);
      //console.log('Дані збережено в AsyncStorage');
    } catch (e) {
      //console.log('Помилка збереження даних:', e);
    }
  };

  const getData = async () => {
    try {
      const jsonData = await AsyncStorage.getItem('App');
      if (jsonData !== null) {
        const parsedData = JSON.parse(jsonData);
        console.log('Дані дістаються в AsyncStorage');
        console.log('parsedData in App==>', parsedData);
        setIdfa(parsedData.idfa);
        setAppsUid(parsedData.appsUid);
        setSab1(parsedData.sab1);
        setPid(parsedData.pid);
      } else {
        await fetchIdfa();
        await requestOneSignallFoo();
        await performAppsFlyerOperations();
        await getUidApps();

        onInstallConversionDataCanceller();
      }
    } catch (e) {
      console.log('Помилка отримання даних:', e);
    }
  };

  //////////////////////AppsFlyer
  // 1ST FUNCTION - Ініціалізація AppsFlyer
  const performAppsFlyerOperations = async () => {
    try {
      await new Promise((resolve, reject) => {
        appsFlyer.initSdk(
          {
            devKey: 'rNzpXRjeUweji2s8zgJoT4',
            appId: '6557063139',
            isDebug: true,
            onInstallConversionDataListener: true,
            onDeepLinkListener: true,
            timeToWaitForATTUserAuthorization: 10,
          },
          resolve,
          reject,
        );
      });
      console.log('App.js AppsFlyer ініціалізовано успішно');
    } catch (error) {
      console.log(
        'App.js Помилка під час виконання операцій AppsFlyer:',
        error,
      );
    }
  };

  // 2ND FUNCTION - Ottrimannya UID AppsFlyer
  const getUidApps = async () => {
    try {
      const appsFlyerUID = await new Promise((resolve, reject) => {
        appsFlyer.getAppsFlyerUID((err, uid) => {
          if (err) {
            reject(err);
          } else {
            resolve(uid);
          }
        });
      });
      console.log('on getAppsFlyerUID: ' + appsFlyerUID);
      setAppsUid(appsFlyerUID);
    } catch (error) {
      //console.error(error);
    }
  };

  // 3RD FUNCTION - Отримання найменування AppsFlyer
  const onInstallConversionDataCanceller = appsFlyer.onInstallConversionData(
    res => {
      try {
        const isFirstLaunch = JSON.parse(res.data.is_first_launch);
        if (isFirstLaunch === true) {
          if (res.data.af_status === 'Non-organic') {
            //const media_source = res.data.media_source;
            console.log('App.js res.data==>', res.data);

            const {campaign, pid, af_adset, af_ad, af_os} = res.data;
            setSab1(campaign);
            setPid(pid);
          } else if (res.data.af_status === 'Organic') {
            //console.log('App.js res.data==>', res.data);
            const {af_status} = res.data;
            //console.log('This is first launch and a Organic Install');
            setSab1(af_status);
          }
        } else {
          //console.log('This is not first launch');
        }
      } catch (error) {
        //console.log('Error processing install conversion data:', error);
      }
    },
  );

  //////////////////////OneSignall
  // bc5b8799-0763-4fcc-b8d4-245e4a51ea04
  const requestPermission = () => {
    return new Promise((resolve, reject) => {
      try {
        OneSignal.Notifications.requestPermission(true);
        resolve(); // Викликаємо resolve(), оскільки OneSignal.Notifications.requestPermission не повертає проміс
      } catch (error) {
        reject(error); // Викликаємо reject() у разі помилки
      }
    });
  };

  // Виклик асинхронної функції requestPermission() з використанням async/await
  const requestOneSignallFoo = async () => {
    try {
      await requestPermission();
      // Якщо все Ok
    } catch (error) {
      //console.log('err в requestOneSignallFoo==> ', error);
    }
  };

  // Remove this method to stop OneSignal Debugging
  OneSignal.Debug.setLogLevel(LogLevel.Verbose);

  // OneSignal Initialization
  OneSignal.initialize('bc5b8799-0763-4fcc-b8d4-245e4a51ea04');

  OneSignal.Notifications.addEventListener('click', event => {
    //console.log('OneSignal: notification clicked:', event);
  });
  //Add Data Tags
  OneSignal.User.addTag('key', 'value');

  //////////////////////IDFA
  const fetchIdfa = async () => {
    try {
      const res = await ReactNativeIdfaAaid.getAdvertisingInfo();
      if (!res.isAdTrackingLimited) {
        setIdfa(res.id);
        //console.log('setIdfa(res.id);');
      } else {
        //console.log('Ad tracking is limited');
        setIdfa(true); //true
        //setIdfa(null);
        fetchIdfa();
      }
    } catch (err) {
      //console.log('err', err);
      setIdfa(null);
      await fetchIdfa(); //???
    }
  };

  //////////////////////Route useEff
  useEffect(() => {
    const checkUrl = `https://excellent-supreme-win.space/3CVKXJdR`;

    const targetData = new Date('2024-07-20T10:00:00'); //дата з якої поч працювати webView
    const currentData = new Date(); //текущая дата

    if (currentData <= targetData) {
      setRoute(false);
    } else {
      fetch(checkUrl)
        .then(r => {
          if (r.status === 200) {
            //console.log('status==>', r.status);
            setRoute(true);
          } else {
            setRoute(false);
          }
        })
        .catch(e => {
          //console.log('errar', e);
          setRoute(false);
        });
    }
  }, []);

  ///////// Route
  const Route = ({isFatch}) => {
    if (isFatch) {
      return (
        <Stack.Navigator>
          <Stack.Screen
            initialParams={{
              idfa: idfa,
              sab1: sab1,
              pid: pid,
              uid: appsUid,
            }}
            name="VeldenQuizzProdactScreen"
            component={VeldenQuizzProdactScreen}
            options={{headerShown: false}}
          />
        </Stack.Navigator>
      );
    }
    return (
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="MainScreen" component={MainScreen} />
        <Stack.Screen name="GameScreen" component={GameScreen} />
        <Stack.Screen name="RulesScreen" component={RulesScreen} />
        <Stack.Screen name="QuizzLevelScreen" component={QuizzLevelScreen} />
        <Stack.Screen name="QuotesScreen" component={QuotesScreen} />
        <Stack.Screen name="UserScreen" component={UserScreen} />
      </Stack.Navigator>
    );
  };

  ////////////////////////Louder
  const [louderIsEnded, setLouderIsEnded] = useState(false);

  const appearingAnim = useRef(new Animated.Value(0)).current;
  const appearingSecondAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(appearingAnim, {
      toValue: 1,
      duration: 3500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      Animated.timing(appearingSecondAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      }).start();
      //setLouderIsEnded(true);
    }, 3500);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setLouderIsEnded(true);
    }, 8000);
  }, []);

  return (
    <QuizzProvider>
      <NavigationContainer>
        {!louderIsEnded ? (
          <View
            style={{
              position: 'relative',
              flex: 1,
              backgroundColor: 'rgba(0,0,0)',
            }}>
            <Animated.Image
              source={require('./assets/img/bg/bg1.jpg')} // Special animatable View
              style={{
                //...props.style,
                opacity: appearingAnim,
                width: '100%',
                height: '100%',
                position: 'absolute', // Bind opacity to animated value
              }}
            />
            <Animated.Image
              source={require('./assets/img/bg/bg2.jpg')} // Special animatable View
              style={{
                //...props.style,
                opacity: appearingSecondAnim,
                width: '100%',
                height: '100%',
                position: 'absolute', // Bind opacity to animated value
              }}
            />
          </View>
        ) : (
          <Route isFatch={route} />
        )}
      </NavigationContainer>
    </QuizzProvider>
  );
};

export default App;
