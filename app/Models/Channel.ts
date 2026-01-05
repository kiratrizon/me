import {
  Model,
} from "Illuminate/Database/Eloquent/index.ts";

export type ChannelSchema = {
  id?: number;
  channel_name: string;
  token: string;
};

class Channel extends Model<ChannelSchema> {
  protected static override _fillable = ["channel_name", "token"];

}

export default Channel;
