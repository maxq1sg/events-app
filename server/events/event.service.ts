import {
  getConnection,
  getManager,
  getRepository,
  SelectQueryBuilder,
} from "typeorm";
import ICreateEvent from "./dtos/create.event";
import Event from "./event.model";
import EventRepository from "./event.repository";

class EventService {
  private eventRepository: any;
  constructor() {
    // this.eventRepository = getConnection()
  }
  async createEvent(body: ICreateEvent) {
    const newEvent = Event.create(body);
    await newEvent.save();
    return newEvent;
  }
}
export default EventService;
