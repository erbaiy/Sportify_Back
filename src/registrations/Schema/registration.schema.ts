import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as mongoose from 'mongoose';

@Schema({
  timestamps: true,
  collection: 'registrations',
})
export class Registration extends Document {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  })
  event: mongoose.Types.ObjectId;

  @Prop({
    type: String,
    required: true,
  })
  participantName: string;

  @Prop({
    type: String,
    required: true,
  })
  participantEmail: string;

  @Prop({ type: Date, default: Date.now })
  registrationDate: Date;
}

export const RegistrationSchema = SchemaFactory.createForClass(Registration);

// Drop any existing indexes and create new ones
RegistrationSchema.index(
  { event: 1, participantEmail: 1 }, 
  { unique: true, background: true }
);