import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type EventDocument = HydratedDocument<Event>;

@Schema({ timestamps: true })
export class Event {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true, trim: true })
  location: string;

  @Prop()
  maxParticipants?: number;

  @Prop({ required: true })
  registrationDeadline: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  organizer: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  participants: Types.ObjectId[];

  @Prop({
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  })
  status: string;
}

export const EventSchema = SchemaFactory.createForClass(Event);

// Validation middleware
EventSchema.pre('save', function(next) {
  if (this.registrationDeadline > this.date) {
    return next(new Error('Registration deadline must be before event date'));
  }
  next();
});

// Method to check if event is full
EventSchema.methods.isFull = function() {
  return this.maxParticipants && this.participants.length >= this.maxParticipants;
};