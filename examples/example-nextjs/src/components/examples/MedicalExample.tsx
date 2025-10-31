'use client';

import { useState } from 'react';
import { useFHEVM, useEncrypt } from '@fhevm/sdk';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

interface MedicalRecord {
  id: string;
  type: string;
  value: string;
  encrypted: boolean;
  timestamp: number;
}

/**
 * Medical Example Component
 * Demonstrates private health data management using FHE
 */
export function MedicalExample() {
  const { isInitialized } = useFHEVM();
  const { encrypt, isEncrypting } = useEncrypt();

  const [recordType, setRecordType] = useState('blood_pressure');
  const [recordValue, setRecordValue] = useState('');
  const [records, setRecords] = useState<MedicalRecord[]>([]);

  const handleAddRecord = async () => {
    if (!recordValue) return;

    try {
      const encrypted = await encrypt(Number(recordValue), 'uint32');

      const newRecord: MedicalRecord = {
        id: Date.now().toString(),
        type: recordType,
        value: encrypted.hash,
        encrypted: true,
        timestamp: Date.now(),
      };

      setRecords([...records, newRecord]);
      setRecordValue('');
    } catch (error) {
      console.error('Failed to add record:', error);
    }
  };

  const recordTypes = [
    { value: 'blood_pressure', label: 'Blood Pressure' },
    { value: 'heart_rate', label: 'Heart Rate' },
    { value: 'glucose_level', label: 'Glucose Level' },
    { value: 'temperature', label: 'Temperature' },
  ];

  return (
    <Card
      title="Private Health Records"
      description="Secure medical data with encrypted health records"
    >
      <div className="space-y-6">
        {/* Add Record Form */}
        <div className="space-y-4">
          <div className="form-group">
            <label className="form-label">Record Type</label>
            <select
              className="form-input"
              value={recordType}
              onChange={(e) => setRecordType(e.target.value)}
            >
              {recordTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <Input
            type="number"
            label="Value"
            placeholder="Enter measurement value"
            value={recordValue}
            onChange={(e) => setRecordValue(e.target.value)}
          />

          <Button
            onClick={handleAddRecord}
            disabled={!isInitialized || !recordValue}
            isLoading={isEncrypting}
            className="w-full"
          >
            Add Encrypted Record
          </Button>
        </div>

        {/* Records List */}
        {records.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Encrypted Health Records</h4>
            <div className="space-y-2">
              {records.slice(-5).reverse().map((record) => (
                <div
                  key={record.id}
                  className="p-3 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-blue-900">
                      {recordTypes.find((t) => t.value === record.type)?.label}
                    </span>
                    <span className="badge badge-success text-xs">Encrypted</span>
                  </div>
                  <code className="text-xs break-all text-blue-600">
                    {record.value.slice(0, 30)}...
                  </code>
                  <p className="text-xs text-blue-600 mt-1">
                    {new Date(record.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Privacy Features */}
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h4 className="font-medium text-sm text-purple-800 mb-2">
            Medical Privacy Protection:
          </h4>
          <ul className="text-xs text-purple-700 space-y-1">
            <li>✓ HIPAA-compliant encryption</li>
            <li>✓ Patient data confidentiality</li>
            <li>✓ Secure health record storage</li>
            <li>✓ Private medical analytics</li>
            <li>✓ Authorized access only</li>
          </ul>
        </div>

        {/* Use Cases */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Healthcare Applications:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Electronic Health Records (EHR)</li>
            <li>• Telemedicine consultations</li>
            <li>• Clinical trial data</li>
            <li>• Insurance claim processing</li>
            <li>• Medical research analytics</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
