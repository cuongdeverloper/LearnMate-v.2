import React from 'react';
import './RatingStar.scss';

const RatingStar = ({ value, onChange, readOnly = false }) => {
  return (
    <div className="rating-star">
      {[1,2,3,4,5].map((star) => (
        <span
          key={star}
          className={
            star <= value
              ? "star filled"
              : "star"
          }
          onClick={() => !readOnly && onChange && onChange(star)}
          style={{ cursor: readOnly ? 'default' : 'pointer' }}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default RatingStar;
