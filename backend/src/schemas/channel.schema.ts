import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChannelDocument = Channel & Document;

@Schema({ timestamps: true })
export class Channel {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  members: Types.ObjectId[];

  @Prop({ default: false })
  isPrivate: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
}

export const ChannelSchema = SchemaFactory.createForClass(Channel);

