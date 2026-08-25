import React from 'react';
import { RTIApplication } from '../../types/rti';
import { ConfirmationCard } from '../../components/status/ConfirmationCard';
import { useRTIDraft } from '../../lib/context/rti-draft';

interface Step9SuccessProps {
  application: RTIApplication;
  onTrack: (regNo: string) => void;
  onFileAnother: () => void;
}

export const Step9Success: React.FC<Step9SuccessProps> = ({
  application,
  onTrack,
  onFileAnother,
}) => {
  const { resetDraft } = useRTIDraft();

  const handleFileAnother = () => {
    resetDraft();
    onFileAnother();
  };

  return (
    <div className="space-y-6">
      <ConfirmationCard
        application={application}
        onTrack={onTrack}
        onFileAnother={handleFileAnother}
      />
    </div>
  );
};
