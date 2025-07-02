import { Router } from 'express';
import { AIService } from '../services/aiService.js';
import { validateRequest } from '../middleware/validation.js';
import { chatSchema } from '../schemas/chat.schemas.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Chat with AI assistant
router.post('/message', validateRequest(chatSchema), async (req, res) => {
  try {
    const { message, context } = req.body;
    
    const response = await AIService.chatAssistant(message, context);
    
    res.json({
      success: true,
      data: { response },
      message: 'Chat response generated successfully'
    });
  } catch (error) {
    logger.error('Chat processing failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process chat message',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as chatRoutes };