// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { HydratedDocument, Types } from 'mongoose';

// export type EventDocument = HydratedDocument<Event>;

// @Schema({ timestamps: true })
// export class Event {
//   @Prop({ required: true, trim: true })
//   title: string;

//   @Prop({ required: false })
//   image?: string;


//   @Prop({ trim: true })
//   description: string;

//   @Prop({ required: true })
//   date: Date;

//   @Prop({ required: true, trim: true })
//   location: string;

//   @Prop()
//   maxParticipants?: number;

//   @Prop({ required: true })
//   registrationDeadline: Date;

//   @Prop({ type: Types.ObjectId, ref: 'User', required: true })
//   organizer: Types.ObjectId;

//   @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
//   participants: Types.ObjectId[];

//   @Prop({
//     type: String,
//     enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
//     default: 'upcoming'
//   })
//   status: string;
// }

// export const EventSchema = SchemaFactory.createForClass(Event);




import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Document as MongooseDocument, Schema as MongooseSchema } from 'mongoose';


export type EventDocument = HydratedDocument<Event>;

@Schema({ timestamps: true })
export class Event {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: false })
  image?: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true, trim: true })
  location: string;

  @Prop()
  maxParticipants?: number; // Maximum number of participants allowed

  @Prop({ required: true })
  registrationDeadline: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  organizer: Types.ObjectId;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Registration' }], // Link to registrations
  })

  
  @Prop({
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming',
  })
  status: string;
}

export const EventSchema = SchemaFactory.createForClass(Event);
