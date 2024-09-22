import axios from 'axios';
import Submission from '../models/Submission.js';

const API_BASE_URL = 'https://gateway-api.kalp.studio/v1/contract/kalp';
const CONTRACT_ADDRESS = 'r8v34Uu4hgvcozWFV24w7L3NjmpbKCUR1726751203916';

export const getTokenURI = async (req, res) => {
  const { tokenId } = req.params;
  const { walletAddress } = req.user; // Assuming you have middleware to attach user info to req

  try {
    const response = await axios.post(`${API_BASE_URL}/query/${CONTRACT_ADDRESS}/TokenURI`, {
      network: 'TESTNET',
      blockchain: 'KALP',
      walletAddress: walletAddress,
      args: {
        tokenId: tokenId
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching TokenURI:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to fetch TokenURI' });
  }
};

export const mintNFT = async (req, res) => {
  const { submissionId } = req.params;
  const { walletAddress } = req.user; // Assuming you have middleware to attach user info to req

  try {
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    if (submission.nftMinted) {
      return res.status(400).json({ error: 'NFT already minted for this submission' });
    }

    // Generate a unique tokenId (you might want to implement a more robust system)
    const tokenId = `${submission.user}-${submission.problem}-${Date.now()}`;

    // Generate tokenURI (you might want to create a more detailed metadata)
    const tokenURI = JSON.stringify({
      name: `Solution for Problem ${submission.problem}`,
      description: `Submitted by ${req.user.username}`,
      image: "https://example.com/placeholder-image.png", // Replace with actual image URL
    });

    const response = await axios.post(`${API_BASE_URL}/invoke/${CONTRACT_ADDRESS}/MintWithTokenURI`, {
      network: 'TESTNET',
      blockchain: 'KALP',
      walletAddress: walletAddress,
      args: {
        tokenId: tokenId,
        tokenURI: tokenURI
      }
    });

    // Update submission with NFT details
    submission.nftMinted = true;
    submission.nftTokenId = tokenId;
    await submission.save();

    res.json({ message: 'NFT minted successfully', tokenId, ...response.data });
  } catch (error) {
    console.error('Error minting NFT:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to mint NFT' });
  }
};