import React, { useState, useRef } from 'react';
import { useRTIDraft } from '../../lib/context/rti-draft';
import { useLanguage } from '../../lib/context/LanguageContext';
import { FormSection } from '../../components/forms/FormSection';
import { FormField } from '../../components/forms/FormField';
import { TextInput } from '../../components/forms/TextInput';
import { Select } from '../../components/forms/Select';
import { VirtualKeyboardWrapper } from '../../components/accessibility/VirtualKeyboardWrapper';
import { validateApplicantDetails } from '../../lib/validation';
import { ApplicantDetails } from '../../types/rti';
import { ArrowLeft, ArrowRight, User, Mail, Phone, MapPin } from 'lucide-react';

interface Step3ApplicantProps {
  onContinue: () => void;
  onBack: () => void;
}

const INDIAN_STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
  'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand',
  'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal',
];

export const Step3Applicant: React.FC<Step3ApplicantProps> = ({ onContinue, onBack }) => {
  const { draft, updateApplicant } = useRTIDraft();
  const { t } = useLanguage();
  const fullNameRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ApplicantDetails>({
    fullName: draft.applicant?.fullName || '',
    gender: draft.applicant?.gender || '',
    email: draft.applicant?.email || '',
    mobile: draft.applicant?.mobile || '',
    country: 'India',
    state: draft.applicant?.state || '',
    city: draft.applicant?.city || '',
    addressLine1: draft.applicant?.addressLine1 || '',
    addressLine2: draft.applicant?.addressLine2 || '',
    pincode: draft.applicant?.pincode || '',
    category: draft.applicant?.category || 'URBAN',
    educationalStatus: draft.applicant?.educationalStatus || 'LITERATE',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof ApplicantDetails, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateApplicantDetails(form);

    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }

    updateApplicant(form);
    onContinue();
  };

  return (
    <form onSubmit={handleProceed} className="space-y-6">
      <FormSection
        title={t('form.applicant.title')}
        description={t('form.applicant.desc')}
      >
        {/* Full Name */}
        <FormField
          id="applicant-fullName"
          label={t('form.applicant.fullName')}
          required
          error={errors.fullName}
          helperText="As per official photo identity document (e.g. Aarav Sharma)."
          rightAction={
            <VirtualKeyboardWrapper
              value={form.fullName}
              onChange={(val) => handleChange('fullName', val)}
              targetInputRef={fullNameRef}
            />
          }
        >
          <TextInput
            ref={fullNameRef}
            id="applicant-fullName"
            leftIcon={<User className="w-4 h-4" />}
            value={form.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            placeholder="e.g. Aarav Sharma"
            error={!!errors.fullName}
          />
        </FormField>

        {/* Gender & Category in 2 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            id="applicant-gender"
            label={t('form.applicant.gender')}
            required
            error={errors.gender}
          >
            <Select
              id="applicant-gender"
              value={form.gender}
              onChange={(e) => handleChange('gender', e.target.value as any)}
              error={!!errors.gender}
              placeholder={t('form.applicant.gender')}
              options={[
                { value: 'MALE', label: t('form.applicant.gender.male') },
                { value: 'FEMALE', label: t('form.applicant.gender.female') },
                { value: 'OTHER', label: t('form.applicant.gender.other') },
                { value: 'PREFER_NOT_TO_SAY', label: t('form.applicant.gender.preferNot') },
              ]}
            />
          </FormField>

          <FormField
            id="applicant-category"
            label={t('form.applicant.category')}
            helperText={t('form.applicant.category.helper')}
          >
            <Select
              id="applicant-category"
              value={form.category || 'URBAN'}
              onChange={(e) => handleChange('category', e.target.value as any)}
              options={[
                { value: 'URBAN', label: t('form.applicant.category.urban') },
                { value: 'RURAL', label: t('form.applicant.category.rural') },
              ]}
            />
          </FormField>
        </div>

        {/* Email & Mobile in 2 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            id="applicant-email"
            label={t('form.applicant.email')}
            required
            error={errors.email}
            helperText="Electronic alerts and registration slips are sent here."
          >
            <TextInput
              id="applicant-email"
              type="email"
              leftIcon={<Mail className="w-4 h-4" />}
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="name@example.com"
              error={!!errors.email}
            />
          </FormField>

          <FormField
            id="applicant-mobile"
            label={t('form.applicant.mobile')}
            required
            error={errors.mobile}
            helperText="10-digit Indian mobile number (e.g. 9876543210)."
          >
            <TextInput
              id="applicant-mobile"
              type="tel"
              maxLength={10}
              leftIcon={<Phone className="w-4 h-4" />}
              value={form.mobile}
              onChange={(e) => handleChange('mobile', e.target.value.replace(/\D/g, ''))}
              placeholder="9876543210"
              error={!!errors.mobile}
            />
          </FormField>
        </div>

        {/* Address Line 1 */}
        <FormField
          id="applicant-address1"
          label={t('form.applicant.address1')}
          required
          error={errors.addressLine1}
          helperText="Physical copies and certified records will be dispatched to this address."
        >
          <TextInput
            id="applicant-address1"
            leftIcon={<MapPin className="w-4 h-4" />}
            value={form.addressLine1}
            onChange={(e) => handleChange('addressLine1', e.target.value)}
            placeholder="Flat / House No., Building Name, Street"
            error={!!errors.addressLine1}
          />
        </FormField>

        {/* Address Line 2 */}
        <FormField
          id="applicant-address2"
          label={t('form.applicant.address2')}
          helperText="Optional landmark or sector."
        >
          <TextInput
            id="applicant-address2"
            value={form.addressLine2 || ''}
            onChange={(e) => handleChange('addressLine2', e.target.value)}
            placeholder="e.g. Sector 6, Dwarka"
          />
        </FormField>

        {/* State, City, PIN in 3 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField
            id="applicant-state"
            label={t('form.applicant.state')}
            required
            error={errors.state}
          >
            <Select
              id="applicant-state"
              value={form.state}
              onChange={(e) => handleChange('state', e.target.value)}
              placeholder={t('form.applicant.state')}
              error={!!errors.state}
              options={INDIAN_STATES.map((s) => ({ value: s, label: s }))}
            />
          </FormField>

          <FormField
            id="applicant-city"
            label={t('form.applicant.city')}
            required
            error={errors.city}
          >
            <TextInput
              id="applicant-city"
              value={form.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="e.g. New Delhi"
              error={!!errors.city}
            />
          </FormField>

          <FormField
            id="applicant-pincode"
            label={t('form.applicant.pincode')}
            required
            error={errors.pincode}
          >
            <TextInput
              id="applicant-pincode"
              maxLength={6}
              value={form.pincode}
              onChange={(e) => handleChange('pincode', e.target.value.replace(/\D/g, ''))}
              placeholder="110075"
              error={!!errors.pincode}
            />
          </FormField>
        </div>
      </FormSection>

      {/* Navigation Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 min-h-[44px] text-sm font-semibold text-gray-700 bg-white border border-[#E2DDD5] rounded-xl hover:bg-gray-50 transition-colors whitespace-normal break-words"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>{t('btn.back')}</span>
        </button>

        <button
          type="submit"
          className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] bg-[#1B4B8F] text-white text-sm font-semibold rounded-xl hover:bg-[#123362] transition-colors shadow-sm focus:ring-4 focus:ring-[#1B4B8F]/20 whitespace-normal break-words"
        >
          <span>{t('btn.continue')}</span>
          <ArrowRight className="w-4 h-4 shrink-0" />
        </button>
      </div>
    </form>
  );
};
