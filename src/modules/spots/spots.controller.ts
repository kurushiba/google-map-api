import { Router, Request, Response } from 'express';
import { Like } from 'typeorm';
import datasource from '../../datasource';
import { Auth } from '../../lib/auth';
import { Spot } from './spot.entity';
import { Favorite } from '../favorites/favorite.entity';

const spotsController = Router();
const spotRepository = datasource.getRepository(Spot);
const favoriteRepository = datasource.getRepository(Favorite);

// スポット一覧取得
spotsController.get('/', Auth, async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query as {
      category?: string;
      search?: string;
    };

    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (search) where.name = Like(`%${search}%`);

    const spots = await spotRepository.find({ where });

    // 現在ユーザーのお気に入りを取得
    const favorites = await favoriteRepository.find({
      where: { userId: req.currentUser.id },
      select: ['spotId'],
    });
    const favoriteSpotIds = new Set(favorites.map((f) => f.spotId));

    const result = spots.map((spot) => ({
      ...spot,
      isFavorite: favoriteSpotIds.has(spot.id),
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error('スポット一覧取得エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// スポット詳細取得
spotsController.get('/:id', Auth, async (req: Request, res: Response) => {
  try {
    const spot = await spotRepository.findOne({ where: { id: req.params.id } });
    if (!spot) {
      res.status(404).json({ message: 'スポットが見つかりません' });
      return;
    }

    const favorite = await favoriteRepository.findOne({
      where: { userId: req.currentUser.id, spotId: spot.id },
    });

    res.status(200).json({ ...spot, isFavorite: !!favorite });
  } catch (error) {
    console.error('スポット詳細取得エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

export default spotsController;
