import React, { useState } from 'react';
import styled from 'styled-components';
import { useGame } from '../contexts/GameContext';

const Container = styled.div`
  background-color: #1e2124;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  color: #ffffff;
  width: 100%;
`;

const Title = styled.h3`
  margin-top: 0;
  margin-bottom: 15px;
  color: #ffffff;
  font-size: 18px;
  border-bottom: 1px solid #36393f;
  padding-bottom: 10px;
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 15px;
  border-bottom: 1px solid #36393f;
`;

const Tab = styled.button`
  background-color: ${props => props.active ? '#7289da' : 'transparent'};
  color: ${props => props.active ? '#ffffff' : '#b9bbbe'};
  border: none;
  padding: 8px 12px;
  margin-right: 5px;
  border-radius: 4px 4px 0 0;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${props => props.active ? '#7289da' : '#36393f'};
  }
`;

const RequestForm = styled.form`
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
`;

const FormGroup = styled.div`
  margin-bottom: 10px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  color: #b9bbbe;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  background-color: #36393f;
  color: #ffffff;
  border: 1px solid #202225;
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  background-color: #36393f;
  color: #ffffff;
  border: 1px solid #202225;
  font-size: 14px;
`;

const Button = styled.button`
  background-color: #7289da;
  color: #ffffff;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
  margin-top: 5px;

  &:hover {
    background-color: #5b6eae;
  }

  &:disabled {
    background-color: #4f545c;
    cursor: not-allowed;
  }
`;

const RequestList = styled.div`
  margin-top: 10px;
`;

const RequestItem = styled.div`
  background-color: #36393f;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 10px;
  font-size: 14px;
`;

const RequestHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
`;

const RequestInfo = styled.div`
  margin-bottom: 10px;
`;

const RequestActions = styled.div`
  display: flex;
  gap: 5px;
`;

const AcceptButton = styled(Button)`
  background-color: #43b581;
  &:hover {
    background-color: #3ca374;
  }
`;

const RejectButton = styled(Button)`
  background-color: #f04747;
  &:hover {
    background-color: #d84040;
  }
`;

const EmptyMessage = styled.p`
  color: #b9bbbe;
  font-style: italic;
  text-align: center;
`;

const MoneyRequests = () => {
  const [activeTab, setActiveTab] = useState('request');
  const [targetPlayer, setTargetPlayer] = useState('');
  const [amount, setAmount] = useState('');
  
  const {
    players,
    pendingMoneyRequests,
    sentMoneyRequests,
    activeLoans,
    requestMoney,
    acceptMoneyRequest,
    rejectMoneyRequest,
    repayLoan,
    getCurrentPlayer
  } = useGame();
  
  const currentPlayer = getCurrentPlayer();
  
  // Debug logging
  console.log('MoneyRequests component state:', {
    pendingRequests: pendingMoneyRequests,
    sentRequests: sentMoneyRequests,
    activeLoans,
    players,
    currentPlayer
  });
  
  // Filter out the current player from the list of players
  const otherPlayers = players.filter(player => player.id !== currentPlayer?.id);
  
  const handleRequestSubmit = (e) => {
    e.preventDefault();
    if (targetPlayer && amount && parseInt(amount) > 0) {
      console.log('Submitting money request:', { targetPlayer, amount });
      requestMoney(targetPlayer, amount);
      setAmount('');
    }
  };
  
  const renderRequestForm = () => (
    <RequestForm onSubmit={handleRequestSubmit}>
      <FormGroup>
        <Label>Request money from:</Label>
        <Select 
          value={targetPlayer} 
          onChange={(e) => setTargetPlayer(e.target.value)}
          required
        >
          <option value="">Select a player</option>
          {otherPlayers.map(player => (
            <option key={player.id} value={player.id}>
              {player.username} (${player.balance})
            </option>
          ))}
        </Select>
      </FormGroup>
      <FormGroup>
        <Label>Amount:</Label>
        <Input
          type="number"
          min="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          required
        />
      </FormGroup>
      <Button 
        type="submit" 
        disabled={!targetPlayer || !amount || parseInt(amount) <= 0}
      >
        Request Money
      </Button>
    </RequestForm>
  );
  
  const renderPendingRequests = () => (
    <RequestList>
      {pendingMoneyRequests.length === 0 ? (
        <EmptyMessage>No pending requests</EmptyMessage>
      ) : (
        pendingMoneyRequests.map(request => {
          // Ensure we have a valid requestId
          const requestId = request.requestId || request.id;
          
          return (
            <RequestItem key={requestId}>
              <RequestHeader>
                <strong>{request.requester.username}</strong>
                <span>${request.amount}</span>
              </RequestHeader>
              <RequestInfo>
                If accepted, they will return ${request.returnAmount} (1.5x)
              </RequestInfo>
              <RequestActions>
                <AcceptButton onClick={() => {
                  console.log('Accepting request:', requestId);
                  acceptMoneyRequest(requestId);
                }}>
                  Accept
                </AcceptButton>
                <RejectButton onClick={() => {
                  console.log('Rejecting request:', requestId);
                  rejectMoneyRequest(requestId);
                }}>
                  Reject
                </RejectButton>
              </RequestActions>
            </RequestItem>
          );
        })
      )}
    </RequestList>
  );
  
  const renderSentRequests = () => (
    <RequestList>
      {sentMoneyRequests.length === 0 ? (
        <EmptyMessage>No sent requests</EmptyMessage>
      ) : (
        sentMoneyRequests.map(request => {
          // Ensure we have a valid requestId
          const requestId = request.requestId || request.id;
          
          return (
            <RequestItem key={requestId}>
              <RequestHeader>
                <strong>To: {request.targetPlayer.username}</strong>
                <span>${request.amount}</span>
              </RequestHeader>
              <RequestInfo>
                Waiting for response...
              </RequestInfo>
            </RequestItem>
          );
        })
      )}
    </RequestList>
  );
  
  const renderActiveLoans = () => (
    <RequestList>
      {activeLoans.length === 0 ? (
        <EmptyMessage>No active loans</EmptyMessage>
      ) : (
        activeLoans.map(loan => {
          // Ensure we have a valid requestId
          const requestId = loan.requestId || loan.id;
          
          return (
            <RequestItem key={requestId}>
              <RequestHeader>
                <strong>
                  {loan.lender.id === currentPlayer?.id 
                    ? `Borrower: ${loan.borrower.username}` 
                    : `Lender: ${loan.lender.username}`}
                </strong>
                <span>${loan.amount} → ${loan.returnAmount}</span>
              </RequestHeader>
              {loan.lender.id !== currentPlayer?.id && (
                <RequestActions>
                  <Button 
                    onClick={() => {
                      console.log('Repaying loan:', requestId);
                      repayLoan(requestId);
                    }}
                    disabled={currentPlayer?.balance < loan.returnAmount}
                  >
                    Repay ${loan.returnAmount}
                  </Button>
                </RequestActions>
              )}
            </RequestItem>
          );
        })
      )}
    </RequestList>
  );
  
  return (
    <Container>
      <Title>Money Requests</Title>
      <TabContainer>
        <Tab 
          active={activeTab === 'request'} 
          onClick={() => setActiveTab('request')}
        >
          Request Money
        </Tab>
        <Tab 
          active={activeTab === 'pending'} 
          onClick={() => setActiveTab('pending')}
        >
          Pending ({pendingMoneyRequests.length})
        </Tab>
        <Tab 
          active={activeTab === 'sent'} 
          onClick={() => setActiveTab('sent')}
        >
          Sent ({sentMoneyRequests.length})
        </Tab>
        <Tab 
          active={activeTab === 'loans'} 
          onClick={() => setActiveTab('loans')}
        >
          Loans ({activeLoans.length})
        </Tab>
      </TabContainer>
      
      {activeTab === 'request' && renderRequestForm()}
      {activeTab === 'pending' && renderPendingRequests()}
      {activeTab === 'sent' && renderSentRequests()}
      {activeTab === 'loans' && renderActiveLoans()}
    </Container>
  );
};

export default MoneyRequests; 