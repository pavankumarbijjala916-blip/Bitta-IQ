# BATT IQ ML Model Development Guide

## Overview

This guide provides comprehensive instructions for developing, training, evaluating, and deploying the Machine Learning model for BATT IQ battery health prediction system.

---

## 1. Model Selection

### Recommended Algorithms

**Primary Choice: Decision Tree Classifier**
- ✅ Highly interpretable (meets explainability requirement)
- ✅ Fast prediction time
- ✅ Handles non-linear relationships
- ✅ Good baseline performance
- ✅ Easy to deploy

**Alternative: Logistic Regression**
- ✅ Fast and lightweight
- ✅ Probabilistic outputs
- ⚠️ Limited flexibility (linear only)
- ✅ Suitable for binary/multiclass classification

**Ensemble Options: Random Forest or Gradient Boosting**
- ✅ High accuracy potential
- ⚠️ Less interpretable
- ✅ Production-ready performance

---

## 2. Feature Engineering

### Input Features

```python
Features:
1. voltage (V)
   - Range: 2.8V - 4.2V (Li-ion), normalized
   - Impact: Indicates battery condition, low voltage = degradation
   
2. temperature (°C)
   - Range: -20°C to 70°C
   - Impact: High temperature accelerates decomposition
   
3. chargeCycles (count)
   - Range: 0 - 3000+
   - Impact: High cycles = aging, capacity loss
   
4. capacity (%)
   - Range: 0% - 100%
   - Impact: Direct measure of battery degradation
   
5. usageDurationDays (optional)
   - Range: 0 - 3650+ days (10 years max)
   - Impact: Time-based degradation indicator

Derived Features:
- voltage_norm: (voltage - 2.8) / 1.4
- temp_norm: (temperature + 20) / 90
- cycles_norm: min(cycles / 1000, 1.0)
- capacity_norm: capacity / 100
- age_norm: min(days / 3650, 1.0)
- cycle_temp_interaction: cycles_norm * temp_norm
```

### Target Variable

```python
Health Status:
- good: Battery in excellent condition (SOH > 80%, functioning normally)
- moderate: Battery showing degradation (SOH 50-80%, needs attention)
- poor: Battery end-of-life (SOH < 50%, needs disposal/recycling)
```

---

## 3. Dataset Preparation

### Training Data Requirements

```
Minimum samples: 500 labeled batteries
Class distribution:
- Good: 40% (200 samples)
- Moderate: 35% (175 samples)
- Poor: 25% (125 samples)

Attributes:
- Must cover diverse battery types (Li-ion, Lead-Acid, LiFePO4, etc.)
- Represent various operating conditions
- Include edge cases (extreme temperatures, high cycles)
```

### Data Collection Script

```python
import pandas as pd
import numpy as np

def generate_synthetic_training_data(n_samples=500):
    """
    Generate synthetic training data for battery health prediction
    """
    data = []
    
    for i in range(n_samples):
        # Generate features
        voltage = np.random.uniform(2.8, 4.2)
        temperature = np.random.uniform(-20, 70)
        cycles = np.random.randint(0, 3000)
        capacity = max(0, 100 - (cycles * 0.02) + np.random.normal(0, 5))
        usage_days = np.random.randint(0, 3650)
        
        # Determine health based on features (ground truth logic)
        soh = (capacity + (voltage - 2.8) * 10 - (max(0, temperature - 45) * 0.5)) / 1.4
        soh = np.clip(soh, 0, 100)
        
        if soh > 80:
            health = 'good'
        elif soh > 50:
            health = 'moderate'
        else:
            health = 'poor'
        
        data.append({
            'voltage': voltage,
            'temperature': temperature,
            'chargeCycles': cycles,
            'capacity': capacity,
            'usageDurationDays': usage_days,
            'soh': soh,
            'health': health
        })
    
    return pd.DataFrame(data)

# Generate and save data
df = generate_synthetic_training_data(500)
df.to_csv('battery_training_data.csv', index=False)
```

---

## 4. Model Training

### Training Pipeline

```python
import numpy as np
import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import joblib

def train_battery_health_model():
    """
    Complete pipeline for training battery health prediction model
    """
    
    # 1. Load data
    df = pd.read_csv('battery_training_data.csv')
    
    # 2. Feature preparation
    feature_cols = ['voltage', 'temperature', 'chargeCycles', 'capacity', 'usageDurationDays']
    X = df[feature_cols]
    y = df['health']
    
    # 3. Feature normalization
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # 4. Train-test split (80-20)
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # 5. Train models
    # Decision Tree (primary)
    dt_model = DecisionTreeClassifier(
        max_depth=10,
        min_samples_split=20,
        min_samples_leaf=10,
        random_state=42
    )
    dt_model.fit(X_train, y_train)
    
    # Random Forest (backup)
    rf_model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        min_samples_split=20,
        random_state=42
    )
    rf_model.fit(X_train, y_train)
    
    # 6. Evaluation
    print("Decision Tree Performance:")
    dt_pred = dt_model.predict(X_test)
    print(f"  Accuracy: {accuracy_score(y_test, dt_pred):.4f}")
    print(f"  Precision: {precision_score(y_test, dt_pred, average='weighted'):.4f}")
    print(f"  Recall: {recall_score(y_test, dt_pred, average='weighted'):.4f}")
    print(f"  F1-Score: {f1_score(y_test, dt_pred, average='weighted'):.4f}")
    
    print("\nRandom Forest Performance:")
    rf_pred = rf_model.predict(X_test)
    print(f"  Accuracy: {accuracy_score(y_test, rf_pred):.4f}")
    print(f"  Precision: {precision_score(y_test, rf_pred, average='weighted'):.4f}")
    print(f"  Recall: {recall_score(y_test, rf_pred, average='weighted'):.4f}")
    print(f"  F1-Score: {f1_score(y_test, rf_pred, average='weighted'):.4f}")
    
    # Cross-validation
    cv_scores = cross_val_score(dt_model, X_train, y_train, cv=5)
    print(f"\nCross-Validation Scores (Decision Tree): {cv_scores}")
    print(f"Mean CV Accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")
    
    # 7. Feature importance
    print("\nFeature Importance (Decision Tree):")
    for col, importance in zip(feature_cols, dt_model.feature_importances_):
        print(f"  {col}: {importance:.4f}")
    
    # 8. Save models
    joblib.dump(dt_model, 'battery_health_model.pkl')
    joblib.dump(scaler, 'feature_scaler.pkl')
    
    return dt_model, scaler

if __name__ == '__main__':
    model, scaler = train_battery_health_model()
    print("\nModels saved successfully!")
```

---

## 5. Model Evaluation Metrics

### Performance Targets

```
Accuracy:        > 85%
Precision:       > 80% (minimize false positives)
Recall:          > 80% (catch all degraded batteries)
F1-Score:        > 80%
Cross-Validation: Consistent across folds
```

### Confusion Matrix Analysis

```
                Predicted
                Good    Moderate  Poor
Actual Good      TN      FP        FP
Actual Moderate  FN      TP        TP
Actual Poor      FN      FN        TP

Focus on:
- False Negatives in "poor" class (missed degraded batteries)
- False Positives in "good" class (over-optimistic assessment)
```

---

## 6. Model Explainability

### Feature Contribution

```python
def explain_prediction(model, features_scaled, feature_names):
    """
    Provide explainability for predictions
    """
    # Get probabilities
    probabilities = model.predict_proba([features_scaled])[0]
    prediction = model.predict([features_scaled])[0]
    classes = model.classes_
    
    # Feature importance (for tree-based models)
    importance = model.feature_importances_
    
    explanation = {
        'prediction': prediction,
        'confidence': probabilities.max(),
        'probabilities': {
            cls: prob for cls, prob in zip(classes, probabilities)
        },
        'feature_importance': {
            name: imp for name, imp in zip(feature_names, importance)
        },
        'top_contributing_features': sorted(
            zip(feature_names, importance),
            key=lambda x: x[1],
            reverse=True
        )[:3]
    }
    
    return explanation
```

### Decision Path

```python
from sklearn.tree import _tree

def get_decision_path(tree_model, features_scaled):
    """
    Extract the decision path taken for a prediction
    """
    tree = tree_model.tree_
    feature_name = [
        "voltage", "temperature", "chargeCycles", "capacity", "usageDurationDays"
    ]
    
    def recurse(node, depth):
        if tree.feature[node] != _tree.TREE_UNDEFINED:
            name = feature_name[tree.feature[node]]
            threshold = tree.threshold[node]
            p = features_scaled[0, tree.feature[node]]
            
            if p <= threshold:
                print("{}({} <= {})".format(" "*depth, name, threshold))
                recurse(tree.children_left[node], depth+1)
            else:
                print("{}({} > {})".format(" "*depth, name, threshold))
                recurse(tree.children_right[node], depth+1)
        else:
            print("{}Class: {}".format(" "*depth, tree.value[node]))
    
    recurse(0, 1)
```

---

## 7. Production Deployment

### API Integration

```python
from fastapi import FastAPI
import joblib
import numpy as np

app = FastAPI()

# Load model
model = joblib.load('battery_health_model.pkl')
scaler = joblib.load('feature_scaler.pkl')

@app.post("/predict")
async def predict(data: dict):
    features = np.array([[
        data['voltage'],
        data['temperature'],
        data['chargeCycles'],
        data['capacity'],
        data.get('usageDurationDays', 0)
    ]])
    
    features_scaled = scaler.transform(features)
    prediction = model.predict(features_scaled)[0]
    probabilities = model.predict_proba(features_scaled)[0]
    
    return {
        'prediction': prediction,
        'confidence': float(probabilities.max()),
        'probabilities': {
            cls: float(prob) 
            for cls, prob in zip(model.classes_, probabilities)
        }
    }
```

---

## 8. Monitoring and Retraining

### Performance Monitoring

```python
def monitor_model_performance(predictions_log):
    """
    Track model performance over time
    """
    df = pd.DataFrame(predictions_log)
    
    # Accuracy trend
    df['correct'] = df['prediction'] == df['actual']
    accuracy_by_week = df.groupby('week')['correct'].mean()
    
    if accuracy_by_week.iloc[-1] < 0.80:  # Threshold
        print("WARNING: Model accuracy dropped below 80%")
        return True  # Flag for retraining
    
    return False
```

### Retraining Schedule

```
- Quarterly: Full model retraining
- Monthly: Performance evaluation
- Weekly: Production monitoring
- Continuous: New data collection
```

---

## Success Criteria

✅ Accuracy > 85%
✅ Feature importance explainable
✅ Minimal false negatives in "poor" class
✅ Training time < 5 minutes
✅ Prediction latency < 500ms
✅ Model size < 10MB
✅ Works with diverse battery types
✅ Robust to edge cases

---

## References

- [Scikit-learn Documentation](https://scikit-learn.org/)
- [Decision Trees Explained](https://en.wikipedia.org/wiki/Decision_tree_learning)
- [Model Interpretability](https://christophm.github.io/interpretable-ml-book/)
