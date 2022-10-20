import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Provider } from '@apps/app/enums/provider.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, type: String, unique: true })
  email: string;

  @Prop({ required: true, type: String })
  password: string;

  @Prop({ required: true, type: Number, enum: Provider })
  provider: Provider;
}

export const UserSchema = SchemaFactory.createForClass(User);
