// ML Prediction Service
import axios from 'axios';
import type { AssessmentInput, MLPrediction, ApiResponse } from '@/types/enhanced';

const ML_API_BASE_URL = import.meta.env.VITE_ML_API_URL || 'http://localhost:5000/api/ml';

export const mlPredictionService = {
  // Get battery health prediction
  async predictBatteryHealth(input: AssessmentInput): Promise<MLPrediction> {
    try {
      const response = await axios.post<ApiResponse<MLPrediction>>(
        `${ML_API_BASE_URL}/predict`,
        {
          voltage: input.voltage,
          temperature: input.temperature,
          chargeCycles: input.chargeCycles,
          capacity: input.capacity,
          usageDurationDays: input.usageDurationDays || 0,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': import.meta.env.VITE_ML_API_KEY,
          },
          timeout: 10000,
        }
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error?.message || 'Failed to get prediction');
      }

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('ML Service Error:', error.response?.data || error.message);
        throw new Error(
          error.response?.data?.error?.message || 'Failed to connect to ML service'
        );
      }
      throw error;
    }
  },

  // Batch prediction for multiple batteries
  async predictBatch(inputs: AssessmentInput[]): Promise<MLPrediction[]> {
    try {
      const response = await axios.post<ApiResponse<MLPrediction[]>>(
        `${ML_API_BASE_URL}/predict-batch`,
        {
          assessments: inputs.map((input) => ({
            voltage: input.voltage,
            temperature: input.temperature,
            chargeCycles: input.chargeCycles,
            capacity: input.capacity,
          })),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': import.meta.env.VITE_ML_API_KEY,
          },
          timeout: 30000,
        }
      );

      if (!response.data.success || !response.data.data) {
        throw new Error('Batch prediction failed');
      }

      return response.data.data;
    } catch (error) {
      console.error('Batch Prediction Error:', error);
      throw error;
    }
  },

  // Get model information
  async getModelInfo() {
    try {
      const response = await axios.get(
        `${ML_API_BASE_URL}/model-info`,
        {
          headers: {
            'X-API-Key': import.meta.env.VITE_ML_API_KEY,
          },
          timeout: 5000,
        }
      );

      return response.data;
    } catch (error) {
      console.error('Model Info Error:', error);
      throw error;
    }
  },

  // Validate input features
  validateInput(input: AssessmentInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Voltage validation (typically 2.8V to 4.2V for Li-ion)
    if (input.voltage < 0 || input.voltage > 5) {
      errors.push('Voltage must be between 0V and 5V');
    }

    // Temperature validation (typically -20°C to 70°C)
    if (input.temperature < -20 || input.temperature > 70) {
      errors.push('Temperature must be between -20°C and 70°C');
    }

    // Charge cycles validation
    if (input.chargeCycles < 0) {
      errors.push('Charge cycles cannot be negative');
    }

    // Capacity validation (0-100%)
    if (input.capacity < 0 || input.capacity > 100) {
      errors.push('Capacity must be between 0% and 100%');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  // Normalize features for model input
  normalizeFeatures(input: AssessmentInput) {
    return {
      voltage_norm: (input.voltage - 2.8) / (4.2 - 2.8), // Normalize to [0, 1]
      temperature_norm: (input.temperature + 20) / 90, // Normalize -20 to 70°C to [0, 1]
      cycles_norm: Math.min(input.chargeCycles / 1000, 1.0), // Normalize, cap at 1000 cycles
      capacity_norm: input.capacity / 100, // Already a percentage
      usage_duration_norm: Math.min((input.usageDurationDays || 0) / 1825, 1.0), // 5 years cap
    };
  },

  // Get explainability information
  async explainPrediction(prediction: MLPrediction) {
    const explanation = {
      status: prediction.prediction,
      confidence: Math.round(prediction.confidence * 100),
      summary:
        prediction.prediction === 'good'
          ? 'Your battery is in excellent condition and should perform well for continued use.'
          : prediction.prediction === 'moderate'
          ? 'Your battery shows moderate degradation. Monitor it closely and plan for maintenance or replacement.'
          : 'Your battery has reached end-of-life and should be disposed of or recycled responsibly.',
      factors: {
        mostInflential: Object.entries(prediction.featureImportance)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 2)
          .map(([factor]) => factor),
        scores: prediction.featureImportance,
      },
      recommendations: this.getRecommendations(prediction),
    };
    return explanation;
  },

  // Generate recommendations based on prediction
  getRecommendations(prediction: MLPrediction): string[] {
    const recommendations: string[] = [];

    if (prediction.prediction === 'good') {
      recommendations.push('Continue current usage patterns');
      recommendations.push('Schedule routine maintenance checks');
      recommendations.push('Keep battery in cool environment');
    } else if (prediction.prediction === 'moderate') {
      recommendations.push('Consider reducing usage intensity');
      recommendations.push('Improve thermal management');
      recommendations.push('Plan for replacement within 6-12 months');
      recommendations.push('Explore refurbishment options before disposal');
    } else {
      recommendations.push('Plan disposal immediately');
      recommendations.push('Check local recycling facilities');
      recommendations.push('Consider specialist E-waste handlers');
      recommendations.push('Document battery history for compliance');
    }

    return recommendations;
  },
};
