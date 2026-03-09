import { Router, Request, Response } from 'express';
import datasource from '../../datasource';
import { Auth } from '../../lib/auth';
import { Favorite } from './favorite.entity';
import { Spot } from '../spots/spot.entity';

const favoritesController = Router();
const favoriteRepository = datasource.getRepository(Favorite);
const spotRepository = datasource.getRepository(Spot);

// お気に入り一覧取得
favoritesController.get('/', Auth, async (req: Request, res: Response) => {
  try {
    const favorites = await favoriteRepository.find({
      where: { userId: req.currentUser.id },
      relations: ['spot'],
    });

    const result = favorites.map((f) => ({
      ...f.spot,
      isFavorite: true,
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error('お気に入り一覧取得エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// お気に入り追加
favoritesController.post(
  '/:spotId',
  Auth,
  async (req: Request, res: Response) => {
    try {
      const spot = await spotRepository.findOne({
        where: { id: req.params.spotId },
      });
      if (!spot) {
        res.status(404).json({ message: 'スポットが見つかりません' });
        return;
      }

      const existing = await favoriteRepository.findOne({
        where: { userId: req.currentUser.id, spotId: req.params.spotId },
      });
      if (existing) {
        res.status(400).json({ message: '既にお気に入りに追加されています' });
        return;
      }

      await favoriteRepository.save({
        userId: req.currentUser.id,
        spotId: req.params.spotId,
      });

      res.status(201).json({ message: 'お気に入りに追加しました' });
    } catch (error) {
      console.error('お気に入り追加エラー:', error);
      res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  }
);

// お気に入り削除
favoritesController.delete(
  '/:spotId',
  Auth,
  async (req: Request, res: Response) => {
    try {
      const favorite = await favoriteRepository.findOne({
        where: { userId: req.currentUser.id, spotId: req.params.spotId },
      });
      if (!favorite) {
        res.status(404).json({ message: 'お気に入りが見つかりません' });
        return;
      }

      await favoriteRepository.remove(favorite);

      res.status(200).json({ message: 'お気に入りから削除しました' });
    } catch (error) {
      console.error('お気に入り削除エラー:', error);
      res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  }
);

export default favoritesController;
