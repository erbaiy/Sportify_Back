import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type RegistrationDocument = HydratedDocument<Registration>;

@Schema({ timestamps: true })
export class Registration {
  @Prop({ type: Types.ObjectId, ref: 'Event', required: true })
  event: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  participant: Types.ObjectId;

  @Prop({ default: Date.now })
  registrationDate: Date;

  @Prop({
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  })
  status: string;

  @Prop({ type: Object, default: null })
  additionalInfo?: Record<string, any>;
}

export const RegistrationSchema = SchemaFactory.createForClass(Registration);

// Unique registration constraint
RegistrationSchema.index({ event: 1, participant: 1 }, { unique: true });