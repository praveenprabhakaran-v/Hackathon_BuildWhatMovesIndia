import React, { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useRTIDraft } from '../../lib/context/rti-draft';
import { useLanguage } from '../../lib/context/LanguageContext';
import { FormSection } from '../../components/forms/FormSection';
import { FormField } from '../../components/forms/FormField';
import { TextInput } from '../../components/forms/TextInput';
import { Select } from '../../components/forms/Select';
import { VirtualKeyboardWrapper } from '../../components/accessibility/VirtualKeyboardWrapper';
import { validateApplicantDetails } from '../../lib/validation';
import { ApplicantDetails } from '../../types/rti';
import { ArrowLeft, ArrowRight, User, Mail, Phone, MapPin, Wand2 } from 'lucide-react';

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

  const {
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<ApplicantDetails>({
    defaultValues: {
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
    },
  });

  const formValues = watch();

  const handleAutoFill = () => {
    const demoData: Partial<ApplicantDetails> = {
      fullName: 'Demo Citizen',
      gender: 'MALE',
      category: 'URBAN',
      email: 'demo.citizen@example.com',
      mobile: '9800000000',
      addressLine1: '12 Mock Bhavan',
      addressLine2: 'Connaught Place',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      country: 'India',
      educationalStatus: 'LITERATE',
    };

    clearErrors();
    Object.entries(demoData).forEach(([key, val]) => {
      setValue(key as keyof ApplicantDetails, val as any, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    });
  };

  const onSubmit = (data: ApplicantDetails) => {
    const result = validateApplicantDetails(data);

    if (!result.isValid) {
      Object.entries(result.errors).forEach(([field, message]) => {
        setError(field as any, { type: 'manual', message });
      });
      return;
    }

    updateApplicant(data);
    onContinue();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormSection
        title={t('form.applicant.title')}
        description={t('form.applicant.desc')}
      >
        {/* Judge / Tester Auto-fill Utility */}
        <div className="flex items-center justify-between pb-3 -mt-1 border-b border-gray-100 flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs text-purple-900/80 font-medium">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
              Judge Mode
            </span>
            <span className="hidden sm:inline text-gray-500">Quick-populate prototype citizen profile</span>
          </div>

          <button
            type="button"
            onClick={handleAutoFill}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-300/80 hover:border-purple-400 rounded-lg transition-all shadow-2xs cursor-pointer focus:ring-2 focus:ring-purple-400 active:scale-[0.98]"
            title="Populate test citizen profile instantly"
          >
            <Wand2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span>Auto-fill Demo Data</span>
          </button>
        </div>

        {/* Full Name */}
        <FormField
          id="applicant-fullName"
          label={t('form.applicant.fullName')}
          required
          error={errors.fullName?.message}
          helperText="As per official photo identity document (e.g. Aarav Sharma)."
          rightAction={
            <VirtualKeyboardWrapper
              value={formValues.fullName}
              onChange={(val) => setValue('fullName', val, { shouldValidate: true, shouldDirty: true })}
              targetInputRef={fullNameRef}
            />
          }
        >
          <TextInput
            ref={fullNameRef}
            id="applicant-fullName"
            leftIcon={<User className="w-4 h-4" />}
            value={formValues.fullName}
            onChange={(e) => setValue('fullName', e.target.value, { shouldValidate: true, shouldDirty: true })}
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
            error={errors.gender?.message}
          >
            <Select
              id="applicant-gender"
              value={formValues.gender}
              onChange={(e) => setValue('gender', e.target.value as any, { shouldValidate: true, shouldDirty: true })}
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
              value={formValues.category || 'URBAN'}
              onChange={(e) => setValue('category', e.target.value as any, { shouldValidate: true, shouldDirty: true })}
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
            error={errors.email?.message}
            helperText="Electronic alerts and registration slips are sent here."
          >
            <TextInput
              id="applicant-email"
              type="email"
              leftIcon={<Mail className="w-4 h-4" />}
              value={formValues.email}
              onChange={(e) => setValue('email', e.target.value, { shouldValidate: true, shouldDirty: true })}
              placeholder="name@example.com"
              error={!!errors.email}
            />
          </FormField>

          <FormField
            id="applicant-mobile"
            label={t('form.applicant.mobile')}
            required
            error={errors.mobile?.message}
            helperText="10-digit Indian mobile number (e.g. 9876543210)."
          >
            <TextInput
              id="applicant-mobile"
              type="tel"
              maxLength={10}
              leftIcon={<Phone className="w-4 h-4" />}
              value={formValues.mobile}
              onChange={(e) => setValue('mobile', e.target.value.replace(/\D/g, ''), { shouldValidate: true, shouldDirty: true })}
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
          error={errors.addressLine1?.message}
          helperText="Physical copies and certified records will be dispatched to this address."
        >
          <TextInput
            id="applicant-address1"
            leftIcon={<MapPin className="w-4 h-4" />}
            value={formValues.addressLine1}
            onChange={(e) => setValue('addressLine1', e.target.value, { shouldValidate: true, shouldDirty: true })}
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
            value={formValues.addressLine2 || ''}
            onChange={(e) => setValue('addressLine2', e.target.value, { shouldValidate: true, shouldDirty: true })}
            placeholder="e.g. Sector 6, Dwarka"
          />
        </FormField>

        {/* State, City, PIN in 3 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField
            id="applicant-state"
            label={t('form.applicant.state')}
            required
            error={errors.state?.message}
          >
            <Select
              id="applicant-state"
              value={formValues.state}
              onChange={(e) => setValue('state', e.target.value, { shouldValidate: true, shouldDirty: true })}
              placeholder={t('form.applicant.state')}
              error={!!errors.state}
              options={INDIAN_STATES.map((s) => ({ value: s, label: s }))}
            />
          </FormField>

          <FormField
            id="applicant-city"
            label={t('form.applicant.city')}
            required
            error={errors.city?.message}
          >
            <TextInput
              id="applicant-city"
              value={formValues.city}
              onChange={(e) => setValue('city', e.target.value, { shouldValidate: true, shouldDirty: true })}
              placeholder="e.g. New Delhi"
              error={!!errors.city}
            />
          </FormField>

          <FormField
            id="applicant-pincode"
            label={t('form.applicant.pincode')}
            required
            error={errors.pincode?.message}
          >
            <TextInput
              id="applicant-pincode"
              maxLength={6}
              value={formValues.pincode}
              onChange={(e) => setValue('pincode', e.target.value.replace(/\D/g, ''), { shouldValidate: true, shouldDirty: true })}
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

