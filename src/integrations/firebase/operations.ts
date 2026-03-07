// Firebase Firestore operations for battery management
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  QueryConstraint,
  addDoc,
  FieldValue,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import type { Battery, Assessment, Notification, Report, User } from '@/types/enhanced';

// ========== Battery Operations ==========
export const batteryOperations = {
  // Create a new battery
  async create(userId: string, batteryData: Omit<Battery, 'id' | 'createdAt' | 'updatedAt'>) {
    const batteriesRef = collection(db, 'batteries');
    const docRef = await addDoc(batteriesRef, {
      ...batteryData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  // Get battery by ID
  async getById(batteryId: string) {
    const docRef = doc(db, 'batteries', batteryId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Battery & { id: string };
    }
    return null;
  },

  // Get all batteries for a user
  async getByUserId(userId: string) {
    const batteriesRef = collection(db, 'batteries');
    const q = query(
      batteriesRef,
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as (Battery & { id: string })[];
  },

  // Update battery
  async update(batteryId: string, updates: Partial<Battery>) {
    const docRef = doc(db, 'batteries', batteryId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  // Delete battery
  async delete(batteryId: string) {
    const docRef = doc(db, 'batteries', batteryId);
    await deleteDoc(docRef);
  },

  // Get batteries with filters
  async getFiltered(userId: string, filters?: { status?: string; type?: string }) {
    const constraints: QueryConstraint[] = [where('userId', '==', userId)];
    
    if (filters?.status) {
      constraints.push(where('status', '==', filters.status));
    }
    if (filters?.type) {
      constraints.push(where('type', '==', filters.type));
    }
    
    constraints.push(orderBy('updatedAt', 'desc'));

    const batteriesRef = collection(db, 'batteries');
    const q = query(batteriesRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as (Battery & { id: string })[];
  },
};

// ========== Assessment Operations ==========
export const assessmentOperations = {
  // Create a new assessment
  async create(userId: string, assessmentData: Omit<Assessment, 'id' | 'createdAt'>) {
    const assessmentsRef = collection(db, 'assessments');
    const docRef = await addDoc(assessmentsRef, {
      ...assessmentData,
      userId,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  // Get assessment by ID
  async getById(assessmentId: string) {
    const docRef = doc(db, 'assessments', assessmentId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Assessment & { id: string };
    }
    return null;
  },

  // Get assessments for a battery
  async getByBatteryId(batteryId: string) {
    const assessmentsRef = collection(db, 'assessments');
    const q = query(
      assessmentsRef,
      where('batteryId', '==', batteryId),
      orderBy('assessmentDate', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as (Assessment & { id: string })[];
  },

  // Get recent assessments for user
  async getRecentByUserId(userId: string, limitCount: number = 10) {
    const assessmentsRef = collection(db, 'assessments');
    const q = query(
      assessmentsRef,
      where('userId', '==', userId),
      orderBy('assessmentDate', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as (Assessment & { id: string })[];
  },

  // Update assessment
  async update(assessmentId: string, updates: Partial<Assessment>) {
    const docRef = doc(db, 'assessments', assessmentId);
    await updateDoc(docRef, updates);
  },
};

// ========== Notification Operations ==========
export const notificationOperations = {
  // Create notification
  async create(notificationData: Omit<Notification, 'id' | 'createdAt'>) {
    const notificationsRef = collection(db, 'notifications');
    const docRef = await addDoc(notificationsRef, {
      ...notificationData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  // Get notifications for user
  async getByUserId(userId: string, includeRead: boolean = true) {
    const notificationsRef = collection(db, 'notifications');
    const constraints: QueryConstraint[] = [where('userId', '==', userId)];
    
    if (!includeRead) {
      constraints.push(where('read', '==', false));
    }
    
    constraints.push(orderBy('createdAt', 'desc'));

    const q = query(notificationsRef, ...constraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as (Notification & { id: string })[];
  },

  // Mark notification as read
  async markAsRead(notificationId: string) {
    const docRef = doc(db, 'notifications', notificationId);
    await updateDoc(docRef, {
      read: true,
      readAt: serverTimestamp(),
    });
  },

  // Delete notification
  async delete(notificationId: string) {
    const docRef = doc(db, 'notifications', notificationId);
    await deleteDoc(docRef);
  },

  // Get unread count
  async getUnreadCount(userId: string) {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('read', '==', false)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  },
};

// ========== Report Operations ==========
export const reportOperations = {
  // Create report
  async create(reportData: Omit<Report, 'id' | 'generatedAt'>) {
    const reportsRef = collection(db, 'reports');
    const docRef = await addDoc(reportsRef, {
      ...reportData,
      generatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  // Get reports for user
  async getByUserId(userId: string) {
    const reportsRef = collection(db, 'reports');
    const q = query(
      reportsRef,
      where('userId', '==', userId),
      orderBy('generatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as (Report & { id: string })[];
  },

  // Get report by ID
  async getById(reportId: string) {
    const docRef = doc(db, 'reports', reportId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Report & { id: string };
    }
    return null;
  },

  // Update report
  async update(reportId: string, updates: Partial<Report>) {
    const docRef = doc(db, 'reports', reportId);
    await updateDoc(docRef, updates);
  },

  // Delete report
  async delete(reportId: string) {
    const docRef = doc(db, 'reports', reportId);
    await deleteDoc(docRef);
  },
};

// ========== User Operations ==========
export const userOperations = {
  // Create or update user profile
  async upsert(userId: string, userData: Partial<User>) {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      await updateDoc(userRef, {
        ...userData,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(userRef, {
        uid: userId,
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  },

  // Get user profile
  async getById(userId: string) {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return userDoc.data() as User;
    }
    return null;
  },

  // Update user profile
  async update(userId: string, updates: Partial<User>) {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  // Update last login
  async updateLastLogin(userId: string) {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      lastLogin: serverTimestamp(),
    });
  },
};

// ========== Analytics Operations ==========
export const analyticsOperations = {
  // Record analytics event
  async recordEvent(eventName: string, userId: string, data?: Record<string, any>) {
    const eventsRef = collection(db, 'analytics');
    await addDoc(eventsRef, {
      event: eventName,
      userId,
      data,
      timestamp: serverTimestamp(),
    });
  },

  // Get user statistics
  async getUserStats(userId: string) {
    const batteriesRef = collection(db, 'batteries');
    const assessmentsRef = collection(db, 'assessments');
    
    const batteriesQuery = query(batteriesRef, where('userId', '==', userId));
    const assessmentsQuery = query(assessmentsRef, where('userId', '==', userId));
    
    const [batteriesSnap, assessmentsSnap] = await Promise.all([
      getDocs(batteriesQuery),
      getDocs(assessmentsQuery),
    ]);

    return {
      totalBatteries: batteriesSnap.size,
      totalAssessments: assessmentsSnap.size,
    };
  },
};

// ========== Batch Operations ==========
export const batchOperations = {
  // Bulk create assessments
  async createMany(assessments: Omit<Assessment, 'id' | 'createdAt'>[]) {
    const assessmentsRef = collection(db, 'assessments');
    const results = [];
    
    for (const assessment of assessments) {
      const docRef = await addDoc(assessmentsRef, {
        ...assessment,
        createdAt: serverTimestamp(),
      });
      results.push(docRef.id);
    }
    
    return results;
  },

  // Bulk update status
  async updateManyStatus(batteryIds: string[], status: any) {
    const updates = batteryIds.map((id) => ({
      id,
      status,
      updatedAt: serverTimestamp(),
    }));
    
    for (const update of updates) {
      const docRef = doc(db, 'batteries', update.id);
      await updateDoc(docRef, update);
    }
  },
};
