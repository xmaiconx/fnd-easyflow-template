import { Module } from '@nestjs/common';
import { MessagePipeline } from './pipeline/MessagePipeline';
import { MessagePipelineFactory } from './pipeline/MessagePipelineFactory';
import { PipelineStepRegistry } from './pipeline/PipelineStepRegistry';
import { SharedModule } from '../shared.module';

// Import all steps
import { SaveMessageStep } from './pipeline/steps/SaveMessageStep';
import { VerifyProjectActiveStep } from './pipeline/steps/VerifyProjectActiveStep';
import { CheckCommandStep } from './pipeline/steps/CheckCommandStep';
import { BufferMessagesStep } from './pipeline/steps/BufferMessagesStep';
import { ConvertMediaToTextStep } from './pipeline/steps/ConvertMediaToTextStep';
import { GenerateAIResponseStep } from './pipeline/steps/GenerateAIResponseStep';
import { SendResponseStep } from './pipeline/steps/SendResponseStep';
import { VerifyAuthorizedSenderStep } from './pipeline/steps/VerifyAuthorizedSenderStep';
import { VerifyTesterStep } from './pipeline/steps/VerifyTesterStep';

// Import buffer steps
import { AddToBufferStep } from './pipeline/steps/AddToBufferStep';
import { LoadBufferedMessagesStep } from './pipeline/steps/LoadBufferedMessagesStep';
import { ClearBufferStep } from './pipeline/steps/ClearBufferStep';

// Import project-specific steps
import {
  MpMyIablueVerifyAuthorizedSenderStep,
  MpMyIablueCheckCommandStep,
  MpMyIablueGenerateAIResponseStep,
} from './pipeline/projects/mp-my-iablue';

/**
 * Messages Module (Shared)
 *
 * Exporta infraestrutura de pipeline para uso em Workers
 */
@Module({
  imports: [SharedModule],
  providers: [
    // Core pipeline infrastructure
    PipelineStepRegistry,
    MessagePipelineFactory,

    // Generic steps
    SaveMessageStep,
    VerifyProjectActiveStep,
    CheckCommandStep,
    BufferMessagesStep,
    ConvertMediaToTextStep,
    GenerateAIResponseStep,
    SendResponseStep,
    VerifyAuthorizedSenderStep,
    VerifyTesterStep,

    // Buffer steps (generic)
    AddToBufferStep,
    LoadBufferedMessagesStep,
    ClearBufferStep,

    // Project-specific steps (MP My IABlue)
    MpMyIablueVerifyAuthorizedSenderStep,
    MpMyIablueCheckCommandStep,
    MpMyIablueGenerateAIResponseStep,

    // Initialize registry with all steps
    {
      provide: 'PIPELINE_STEP_INITIALIZER',
      useFactory: (
        registry: PipelineStepRegistry,
        saveMessage: SaveMessageStep,
        verifyProjectActive: VerifyProjectActiveStep,
        checkCommand: CheckCommandStep,
        bufferMessages: BufferMessagesStep,
        convertMedia: ConvertMediaToTextStep,
        generateAI: GenerateAIResponseStep,
        sendResponse: SendResponseStep,
        verifyAuthorized: VerifyAuthorizedSenderStep,
        verifyTester: VerifyTesterStep,
        addToBuffer: AddToBufferStep,
        loadBuffered: LoadBufferedMessagesStep,
        clearBuffer: ClearBufferStep,
        mpVerifyAuthorized: MpMyIablueVerifyAuthorizedSenderStep,
        mpCheckCommand: MpMyIablueCheckCommandStep,
        mpGenerateAI: MpMyIablueGenerateAIResponseStep,
      ) => {
        // Register all steps
        registry.register(saveMessage.name, saveMessage);
        registry.register(verifyProjectActive.name, verifyProjectActive);
        registry.register(checkCommand.name, checkCommand);
        registry.register(bufferMessages.name, bufferMessages);
        registry.register(convertMedia.name, convertMedia);
        registry.register(generateAI.name, generateAI);
        registry.register(sendResponse.name, sendResponse);
        registry.register(verifyAuthorized.name, verifyAuthorized);
        registry.register(verifyTester.name, verifyTester);

        // Register buffer steps
        registry.register(addToBuffer.name, addToBuffer);
        registry.register(loadBuffered.name, loadBuffered);
        registry.register(clearBuffer.name, clearBuffer);

        // Register project-specific steps
        registry.register(mpVerifyAuthorized.name, mpVerifyAuthorized);
        registry.register(mpCheckCommand.name, mpCheckCommand);
        registry.register(mpGenerateAI.name, mpGenerateAI);

        return registry;
      },
      inject: [
        PipelineStepRegistry,
        SaveMessageStep,
        VerifyProjectActiveStep,
        CheckCommandStep,
        BufferMessagesStep,
        ConvertMediaToTextStep,
        GenerateAIResponseStep,
        SendResponseStep,
        VerifyAuthorizedSenderStep,
        VerifyTesterStep,
        AddToBufferStep,
        LoadBufferedMessagesStep,
        ClearBufferStep,
        MpMyIablueVerifyAuthorizedSenderStep,
        MpMyIablueCheckCommandStep,
        MpMyIablueGenerateAIResponseStep,
      ],
    },
  ],
  exports: [
    PipelineStepRegistry,
    MessagePipelineFactory,
    // Export all steps for direct injection if needed
    SaveMessageStep,
    VerifyProjectActiveStep,
    CheckCommandStep,
    BufferMessagesStep,
    ConvertMediaToTextStep,
    GenerateAIResponseStep,
    SendResponseStep,
    VerifyAuthorizedSenderStep,
    VerifyTesterStep,
    AddToBufferStep,
    LoadBufferedMessagesStep,
    ClearBufferStep,
    MpMyIablueVerifyAuthorizedSenderStep,
    MpMyIablueCheckCommandStep,
    MpMyIablueGenerateAIResponseStep,
  ],
})
export class MessagesModule {}
