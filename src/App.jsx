import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import abi from "../abi.json";
import "./App.css";
import { Card, Button, TextField, Typography, Box, CircularProgress, Container} from '@mui/material';
import { styled } from '@mui/material/styles';

const primaryContractAddress = "0xDb487631767361A0abe6Cc235824d08279B09F16";


const StyledCard = styled(Card)(({ theme }) => ({ padding: theme.spacing(3), maxWidth: 480, width: '100%', marginTop: theme.spacing(4)}));

const BalanceCard = styled(Box)(({ theme }) => ({ backgroundColor: theme.palette.grey[100], padding: theme.spacing(2), borderRadius: theme.shape.borderRadius, textAlign: 'center', marginBottom: theme.spacing(3) }));

const App = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [primaryContract, setPrimaryContract] = useState(null);
  const [balance, setBalance] = useState("0");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const initializeEthers = async () => {
      if (window.ethereum) {
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const _provider = new ethers.BrowserProvider(window.ethereum);
          const _signer = await _provider.getSigner();

          const _primaryContract = new ethers.Contract(
            primaryContractAddress,
            abi,
            _signer
          );

          setProvider(_provider);
          setSigner(_signer);
          setPrimaryContract(_primaryContract);
          setSuccess("MetaMask connected successfully!");
        } catch (error) {
          setError("Failed to connect to MetaMask.");
          console.error(error);
        }
      } else {
        setError("Please install MetaMask to use this application.");
      }
    };

    initializeEthers();
  }, []);

  const getBalance = async () => {
    if (provider) {
      setLoading(true);
      setError("");
      setSuccess("");
      try {
        const _balance = await provider.getBalance(primaryContractAddress);
        setBalance(ethers.formatEther(_balance));
        setSuccess("Balance fetched successfully.");
      } catch (error) {
        console.error("Failed to fetch balance:", error);
        setError("Failed to fetch balance.");
      } finally {
        setLoading(false);
      }
    } else {
      setError("Provider not initialized.");
    }
  };

  const deposit = async () => {
    if (primaryContract && amount) {
      setLoading(true);
      setError("");
      setSuccess("");
      try {
        const tx = await primaryContract.deposit(ethers.parseEther(amount), {
          value: ethers.parseEther(amount),
        });
        await tx.wait();
        setSuccess("Deposit successful!");
        getBalance();
      } catch (error) {
        console.error("Deposit failed:", error);
        setError("Deposit failed!");
      } finally {
        setLoading(false);
      }
    } else {
      setError("Please enter a valid amount.");
    }
  };

  const withdraw = async () => {
    if (primaryContract && amount) {
      setLoading(true);
      setError("");
      setSuccess("");
      try {
        const tx = await primaryContract.withdraw(ethers.parseEther(amount));
        await tx.wait();
        setSuccess("Withdrawal successful!");
        getBalance();
      } catch (error) {
        console.error("Withdrawal failed:", error);
        if (error.code === "CALL_EXCEPTION") {
          setError("Insufficient balance for withdrawal.");
        } else {
          setError("Withdrawal failed!");
        }
      } finally {
        setLoading(false);
      }
    } else {
      setError("Please enter a valid amount.");
    }
  };

  return (
    <Container sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
      <StyledCard>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Kenny ETH Piggy Bank
          </Typography>
          <Typography color="text.secondary">
            Deposit or withdraw your ETH securely
          </Typography>
        </Box>

        <BalanceCard>
          <Typography color="text.secondary" variant="body2">
            Current Balance
          </Typography>
          <Typography variant="h5" component="p" sx={{ my: 1 }}>
            {balance} ETH
          </Typography>
          <Button variant="outlined" onClick={getBalance} disabled={loading} size="small">
            {loading ? <CircularProgress size={20} /> : "Refresh Balance"}
          </Button>
        </BalanceCard>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField type="number" label="Amount in ETH" value={amount} onChange={(e) => setAmount(e.target.value)} fullWidth inputProps={{ step: "0.0001", min: "0" }} />
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Button variant="contained" onClick={deposit} disabled={loading || !amount} >
              {loading ? <CircularProgress size={20} /> : "Deposit"}
            </Button>
            <Button  variant="outlined"  onClick={withdraw}  disabled={loading || !amount} >
              {loading ? <CircularProgress size={20} /> : "Withdraw"}
            </Button>
          </Box>

          {(error || success) && (
            <Box sx={{ p: 2,borderRadius: 1, bgcolor: error ? 'error.light' : 'success.light', color: error ? 'error.dark' : 'success.dark', }}>
              <Typography variant="body2">
                {error || success}
              </Typography>
            </Box>
          )}

          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}
          >
            Transaction fees may apply
          </Typography>
        </Box>
      </StyledCard>
    </Container>
  );
};

export default App;