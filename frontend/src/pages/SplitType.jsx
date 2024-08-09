import React, { useState } from 'react';

const SplitType = ({ groupMembers, amount, onConfirm, onClose }) => {
  const [selectedPayees, setSelectedPayees] = useState([]);
  const [splitOption, setSplitOption] = useState('equal');
  const [isSplitDialogVisible, setIsSplitDialogVisible] = useState(true);

  const handleSplitOptionChange = (option) => {
    setSplitOption(option);
    const updatedPayees = groupMembers.map((member) => ({ member, value: '' }));
    setSelectedPayees(updatedPayees);
  };

  const handleSplitChange = () => {
    setIsSplitDialogVisible(true);
  };

  const handlePayeeValueChange = (member, value) => {
    setSelectedPayees((prev) =>
      prev.map((payee) => (payee.member === member ? { ...payee, value } : payee))
    );
  };

  const handlePayeeSelection = (member) => {
    setSelectedPayees((prev) =>
      prev.some((payee) => payee.member === member)
        ? prev.filter((payee) => payee.member !== member)
        : [...prev, { member, value: '' }]
    );
  };
  

  const confirmPayees = () => {
    let updatedPayees = [...selectedPayees];

    if (splitOption === 'equal') {
      const equalAmount = (amount / updatedPayees.length).toFixed(2);
      updatedPayees = updatedPayees.map(payee => ({ ...payee, value: equalAmount }));
    } else if (splitOption === 'amount') {
      const totalAmount = updatedPayees.reduce((sum, payee) => sum + parseFloat(payee.value || 0), 0);
      if (totalAmount !== parseFloat(amount)) {
        alert('The sum of the amounts does not equal the total amount.');
        return;
      }
    } else if (splitOption === 'shares') {
      const totalShares = updatedPayees.reduce((sum, payee) => sum + parseFloat(payee.value || 0), 0);
      const shareAmount = (amount / totalShares).toFixed(2);
      updatedPayees = updatedPayees.map(payee => ({ ...payee, value: (shareAmount * payee.value).toFixed(2) }));
    } else if (splitOption === 'percentage') {
      const totalPercentage = updatedPayees.reduce((sum, payee) => sum + parseFloat(payee.value || 0), 0);
      if (totalPercentage !== 100) {
        alert('The sum of the percentages must equal 100.');
        return;
      }
      updatedPayees = updatedPayees.map(payee => ({ ...payee, value: ((amount * payee.value) / 100).toFixed(2) }));
    }

    onConfirm(updatedPayees);
    setIsSplitDialogVisible(false);
  };

  return isSplitDialogVisible ? (
    <div onClick={onClose}>
      <div
        className="fixed right-10 top-20 bg-white rounded-lg shadow-lg p-4 border"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          &times;
        </button>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Split By</h3>
        <h4 className="text-lg font-medium text-gray-900 mb-2">Total Amount: {amount}</h4>
        <div className="flex justify-around mb-4">
          <button
            type="button"
            className={`px-4 py-2 rounded-lg ${splitOption === 'equal' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => handleSplitOptionChange('equal')}
          >
            Equally
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-lg ${splitOption === 'amount' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => handleSplitOptionChange('amount')}
          >
            By Amount
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-lg ${splitOption === 'shares' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => handleSplitOptionChange('shares')}
          >
            By Shares
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-lg ${splitOption === 'percentage' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => handleSplitOptionChange('percentage')}
          >
            By Percentage
          </button>
        </div>
        <div className="max-h-48 overflow-y-auto">
          {groupMembers.map((member) => (
            <div key={member} className="flex items-center mb-2">
              <label className="text-gray-700 w-1/4">{member}</label>
              {splitOption === 'equal' ? (
                <input
                  type="checkbox"
                  checked={selectedPayees.some((payee) => payee.member === member)}
                  onChange={() => handlePayeeSelection(member)}
                  className="mr-2"
                />
              ) : (
                <input
                  type="number"
                  placeholder={splitOption === 'amount' ? 'Amount' : splitOption === 'percentage' ? 'Percentage' : 'Shares'}
                  value={selectedPayees.find((payee) => payee.member === member)?.value || ''}
                  onChange={(e) => handlePayeeValueChange(member, e.target.value)}
                  className="w-3/4 px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          className="mt-4 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-500 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={confirmPayees}
        >
          Confirm
        </button>
      </div>
    </div>
  ) : null;
};

export default SplitType;
