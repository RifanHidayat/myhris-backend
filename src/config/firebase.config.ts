import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseConfig {
  private static instance: FirebaseConfig;
  private firebaseApp: admin.app.App;

  constructor() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    if (!admin.apps.length) {
      const serviceAccount = {
        type: 'service_account',
        project_id: 'siscom-hris',
        private_key_id: '1b9d6cc1e5f72e9a3c2f7ea2e8978853a611203b',
        private_key:
          '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCkbQpD7VgwvJ7I\nPZhMRk9TTNukusArnKMfC5YjQoSnp1FSx/1FGNx65gLpoTMNkP0BrKWinST2mIy3\n2PJtOLoGVAJ/cRSXQwQ2c5HwT26WuQbbYAIKdfnMofNRK8VHo1i9Bfo5YYUP7TSq\nVj2Ndp6/NB0zKrVYbfD7a/WbQ5Vl8jl/bIAHLlbZ/hXTMDVh3l3Rg3LQpgOtcHdJ\neb93Jivnp+yim9fhQ3jiX0P5K7WJf0Lse7QlspJgQQanN42kD0X6OQhzKzUsfhXy\nHsl4gsO0B4NTLS4hsp//96ieVLO4JmigweM2W84a5mUXr4KgZJRUy8eZBRsBCJVc\njAdpZl2VAgMBAAECggEAOUOyjgq0qrCeWh29k17vVJMRcfMKZ4Xzd6X44YnSmnMW\nyw5UokJw0yqVPBnEpoZm3zTqMNKq42kopQTdFXXqr7aFci4HXlDcQDyKyJdZbAu/\nnBp5S3xgBcknbQ8h83urtZVF2sMgbPYPX/2ODV0RF4VGYCIRK12Kzn2AedUVTH37\nIgTJ/gFvkApz5jy9lAdnL+xITtfY2LYOaLBhKTu7XKqcfBYR1fudXlcCPdbivteL\nigYDu8ae6UVg4qNofQlu/paDN0hmD/q1sWe1xKGVEf+MEeL+5UVpQQUNzBZyIyrV\n9F0OcM9YhARbTMGSDQXMgkzqoRk74muiCGmsK4xs5wKBgQDAx52SOD8Ij1OijU+S\ndpLTY540oWlVcc+8qRov1g4hittSPRpXw/D7dHDjwb0MKohFp6MWemamMb+noxsv\nRQsmc4Rw0G2pg1NA0nu2D5mJJeTA7x5f6OWTq2RNzecKMLIKLeNw6AW+CTikSYDa\nBFSdNu+8bYNMNv0E5nc1PgOjwwKBgQDaWQuI2YMmJOmbvPwC26BjMpXkgWSDHL7h\nxfGW9SouauMIkEnrm7dRaaR0rR7aY1SG0keP1iYlGqqk9A6x5FBRnd8+UbnP9k1r\nuEKTrY90Fj2nkvfU/N1fb6z39GDrFeGoDTTyVp2yIX6nTfTjGDEUim5ydUVPCuyN\ncwF+rjmbxwKBgQCOFFCIjJXATEn6mqVTr7pEu73E0lWcmLXfOM5JBT0C8aD0+n2o\nw4ue99GfupEHH22x0Hw9O9bdk/rJpUeKzhsKqsaokqTP8y7vrnFo3BRvZRM0Msez\nLiXNcNsLEL6/3uXI5Msk0oww5ADv7BBgHiLyf6OuvxOunzRZYTXocp0iGwKBgHqg\nI7A5qEQV2vTSEB5yxgKv+Cqa2J4h2LnndyS2j3f+I389uaYOj8ezMt8sEvXHb0NA\neVw4gre34Do/rrkNZmZP6X6QW3CF/TkQBKP3h2dEzl98VJ9TW+grSdL/dibQ5SiC\nMkgfiPTvhrfjOjMH9Rh6Hkk9vy0DD5LpEd/ZbRUlAoGAMOotHIl3iOO34Q60vCIg\np8tHNznDt3Q10R7rzH5iMkL+S0ZoiR8IOyae6HpWEJrqMTfVhDETf+cfd8LMqbDl\nDfws4VI3MMj3+MtGRTHvLveSvY71uaGztvs+gLz6oikbN7i1iJII4v1LzvuFn3JM\nd+P9bGbnqjNhhDiHC2YqagA=\n-----END PRIVATE KEY-----\n',
        client_email:
          'firebase-adminsdk-vb6z0@siscom-hris.iam.gserviceaccount.com',
        client_id: '102876094110911628432',
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url:
          'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url:
          'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-vb6z0%40siscom-hris.iam.gserviceaccount.com',
        universe_domain: 'googleapis.com',
      };

      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(
          serviceAccount as admin.ServiceAccount,
        ),
        projectId: 'siscom-hris',
      });
    } else {
      this.firebaseApp = admin.app();
    }
  }

  public getFirebaseApp(): admin.app.App {
    return this.firebaseApp;
  }

  public getMessaging(): admin.messaging.Messaging {
    return this.firebaseApp.messaging();
  }

  public static getInstance(): FirebaseConfig {
    if (!FirebaseConfig.instance) {
      FirebaseConfig.instance = new FirebaseConfig();
    }
    return FirebaseConfig.instance;
  }
}
