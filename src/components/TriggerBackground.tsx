import React from 'react';

const TriggerBackground: React.FC = () => {
  const triggerBackgroundFunction = async () => {
    try {
      const response = await fetch('/my-app/netlify/functions/netlifyBgFunction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: 'example' }),
      });
      
      const data = await response.json();
      console.log('Background function response:', data);
      alert('Background task started! Check Netlify logs for progress.');
    } catch (error) {
      console.error('Error triggering background function:', error);
    }
  };

  return (
    <div>
      <h2>Background Function Demo</h2>
      <button onClick={triggerBackgroundFunction}>
        Trigger Background Function
      </button>
    </div>
  );
};

export default TriggerBackground;