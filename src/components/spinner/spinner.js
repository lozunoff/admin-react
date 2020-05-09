import React from 'react';

const Spinner = ({ active }) => (
  <div className={active ? 'spinner active' : 'spinner'}>
    <div uk-spinner="ratio: 3" />
  </div>
);

export default Spinner;
