import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Battery, AlertTriangle, CheckCircle } from 'lucide-react';
import type { Assessment } from '@/types/enhanced';

interface AssessmentResultsProps {
  assessment: Assessment | null;
  isLoading: boolean;
  error?: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const progressVariants: Variants = {
  hidden: { width: 0 },
  visible: (value: number) => ({
    width: `${value}%`,
    transition: { duration: 1.5 },
  }),
};

const pulseVariants: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
    },
  },
};

export const AnimatedAssessmentResults: React.FC<AssessmentResultsProps> = ({
  assessment,
  isLoading,
  error,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Battery className="w-12 h-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-red-500 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Assessment Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!assessment) {
    return null;
  }

  const { mlPrediction, recommendation, healthCategory } = assessment;
  const statusColor = {
    good: 'text-green-600',
    moderate: 'text-yellow-600',
    poor: 'text-red-600',
  };

  const statusBgColor = {
    good: 'bg-green-50',
    moderate: 'bg-yellow-50',
    poor: 'bg-red-50',
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Main Result Card */}
      <motion.div variants={itemVariants}>
        <Card className={`${statusBgColor[healthCategory]} border-2`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <motion.div
                variants={pulseVariants}
                animate="animate"
              >
                <Battery className={`w-8 h-8 ${statusColor[healthCategory]}`} />
              </motion.div>
              <div>
                <span className={`${statusColor[healthCategory]}`}>
                  Battery Health: {healthCategory.toUpperCase()}
                </span>
              </div>
            </CardTitle>
            <CardDescription>
              Assessment completed with {Math.round(mlPrediction.confidence * 100)}% confidence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              {mlPrediction.prediction === 'good'
                ? 'Your battery is in excellent condition and suitable for continued use.'
                : mlPrediction.prediction === 'moderate'
                ? 'Your battery is showing signs of degradation. Consider maintenance or replacement soon.'
                : 'Your battery has reached end-of-life and should be responsibly disposed of or recycled.'}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Probability Distribution */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Health Category Probabilities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(mlPrediction.probabilities).map(([category, probability]) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium capitalize">{category}</span>
                  <span className="text-sm font-semibold">
                    {Math.round(probability * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <motion.div
                    custom={probability * 100}
                    variants={progressVariants}
                    initial="hidden"
                    animate="visible"
                    className={`h-full rounded-full ${
                      category === 'good'
                        ? 'bg-green-500'
                        : category === 'moderate'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                  />
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Feature Importance */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contributing Factors</CardTitle>
            <CardDescription>
              How each parameter influenced the health assessment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(mlPrediction.featureImportance).map(([feature, importance]) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium capitalize text-sm">{feature}</span>
                    <span className="text-sm font-bold text-indigo-600">
                      {Math.round(importance * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
                    <motion.div
                      custom={importance * 100}
                      variants={progressVariants}
                      initial="hidden"
                      animate="visible"
                      className="h-full bg-indigo-500 rounded-full"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recommendation */}
      <motion.div variants={itemVariants}>
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-semibold text-blue-900 mb-1">
                Recommended Action: {recommendation.method.replace('-', ' ').toUpperCase()}
              </p>
              <p className="text-sm text-blue-800">{recommendation.reasoning}</p>
            </div>
            
            {recommendation.recommendedFacility && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="p-3 bg-white rounded border border-blue-200 mt-3"
              >
                <p className="font-medium text-sm mb-1">Recommended Facility:</p>
                <p className="text-sm font-semibold">{recommendation.recommendedFacility.name}</p>
                <p className="text-sm text-gray-600 mb-1">{recommendation.recommendedFacility.location}</p>
                <p className="text-sm text-gray-600">{recommendation.recommendedFacility.contact}</p>
              </motion.div>
            )}

            {recommendation.environmentalImpact && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="p-3 bg-green-100 rounded border border-green-300 mt-2"
              >
                <p className="text-sm text-green-800">{recommendation.environmentalImpact}</p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default AnimatedAssessmentResults;
