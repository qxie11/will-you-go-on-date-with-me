import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface DateResponse {
  id: string;
  createdAt: string;
  partnerName?: string;
  food?: { id: string; title: string };
  flowers?: { id: string; title: string };
  date?: { id: string; label: string };
  customDateTime?: string;
  contact?: string;
  note?: string;
  status: string;
}

@Injectable()
export class ResponsesService {
  private readonly logger = new Logger(ResponsesService.name);
  private readonly dataDir = path.resolve(process.cwd(), 'data');
  private readonly responsesPath = path.join(this.dataDir, 'responses.json');

  constructor() {
    this.ensureDataDir();
  }

  private ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  private readResponses(): DateResponse[] {
    this.ensureDataDir();
    try {
      if (fs.existsSync(this.responsesPath)) {
        const raw = fs.readFileSync(this.responsesPath, 'utf8');
        return JSON.parse(raw);
      }
    } catch (err) {
      this.logger.error('Error reading responses.json', err);
    }
    return [];
  }

  private writeResponses(responses: DateResponse[]): void {
    this.ensureDataDir();
    fs.writeFileSync(this.responsesPath, JSON.stringify(responses, null, 2), 'utf8');
  }

  getAll(): DateResponse[] {
    return this.readResponses();
  }

  create(dto: Partial<DateResponse>): DateResponse {
    const list = this.readResponses();
    const newEntry: DateResponse = {
      id: 'resp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      createdAt: new Date().toISOString(),
      partnerName: dto.partnerName || '',
      food: dto.food || undefined,
      flowers: dto.flowers || undefined,
      date: dto.date || undefined,
      customDateTime: dto.customDateTime || '',
      contact: dto.contact || '',
      note: dto.note || '',
      status: 'Accepted 💖',
    };

    list.unshift(newEntry);
    this.writeResponses(list);
    return newEntry;
  }

  updateStatus(id: string, status: string): DateResponse {
    const list = this.readResponses();
    const item = list.find((r) => r.id === id);
    if (!item) {
      throw new NotFoundException(`Response with ID ${id} not found`);
    }
    item.status = status;
    this.writeResponses(list);
    return item;
  }

  delete(id: string): boolean {
    const list = this.readResponses();
    const filtered = list.filter((r) => r.id !== id);
    if (filtered.length === list.length) {
      throw new NotFoundException(`Response with ID ${id} not found`);
    }
    this.writeResponses(filtered);
    return true;
  }

  clearAll(): boolean {
    this.writeResponses([]);
    return true;
  }

  getStats() {
    const list = this.readResponses();
    const total = list.length;
    const foodCounts: Record<string, number> = {};
    const flowerCounts: Record<string, number> = {};

    list.forEach((r) => {
      if (r.food?.title) {
        foodCounts[r.food.title] = (foodCounts[r.food.title] || 0) + 1;
      }
      if (r.flowers?.title) {
        flowerCounts[r.flowers.title] = (flowerCounts[r.flowers.title] || 0) + 1;
      }
    });

    const topFood = Object.entries(foodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None yet';
    const topFlower = Object.entries(flowerCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None yet';

    return {
      totalResponses: total,
      topFood,
      topFlower,
      recent: list.slice(0, 5),
    };
  }
}
