import { GameCode } from './../../../view-models/game.vm';
import { MemberGameHistoryEntity } from '@entities/member-game-history.entity';
import { BaseConnection } from '@services/base-connection';
import { PageQuery, ListResult, QueryCountDbModel } from '@view-models/common.vm';
import { AdminMemberGameHistoryParameterVM, AdminMemberGameHistoryVM } from '@view-models/admin.game.vm';
import { FindConditions, Between, MoreThan, LessThan, IsNull, Not } from 'typeorm';
import { MemberBlockHistoryEntity } from '@entities/member-block-history.entity';
import { checker } from '@utilities';
import { ExportResult, exporter } from '@utilities/exporter';

const baseSql = `
select 
history.id as id,
history.member_id as memberId,
m.car_plus_member_id as carPlusMemberId,
m.short_id as memberShortId,
g.id as gameId,
history.date_created as dateCreated,
history.game_score as gameScore,
history.game_point as gamePoint,
history.date_finished as dateFinished,
m.nick_name as memberNickName,
g.name as gameName,
ROW_NUMBER () OVER ( order by history.date_created desc) as row

from member_game_history history
join member as m on m.id = history.member_id
join game as g on g.id = history.game_id
`

type MemberGameHistoryDbViewModel = {
    id: string
    memberId: string
    carPlusMemberId: string
    gameId: string
    memberShortId: string
    dateCreated: Date
    gameScore: number
    gamePoint: number
    dateFinished: Date
    memberNickName: string
    gameName: string
    row: number
}

type ExportGameHistoryItem = {
    id: string
    carPlusMemberId: string
    memberShortId: string
    memberNickName: string
    gameName: string
    dateCreated: Date
    dateFinished: Date
    gameScore: number
    gamePoint: number
}
export class AdminGameHistoryLibSvc extends BaseConnection {

    async getGameHistory(param: PageQuery<AdminMemberGameHistoryParameterVM>): Promise<ListResult<AdminMemberGameHistoryVM>> {

        const conditions: string[] = ['1 = 1', 'history.date_finished is not null'];
        const parameters: any = {};


        if (!checker.isNullOrUndefinedOrWhiteSpace(param.params.memberId)) {
            conditions.push(`m.car_plus_member_id = :memberId`);
            parameters.memberId = param.params.memberId
        }

        if (!checker.isNullOrUndefinedOrWhiteSpace(param.params.shortId)) {
            conditions.push(`m.short_id = :shortId`);
            parameters.shortId = param.params.shortId
        }

        if (checker.isDate(param.listQueryParam.dateEnd) && checker.isDate(param.listQueryParam.dateStart)) {
            conditions.push(`history.date_created between :dateStart and :dateEnd`);
            parameters.dateStart = param.listQueryParam.dateStart
            parameters.dateEnd = param.listQueryParam.dateEnd
        } else if (checker.isDate(param.listQueryParam.dateStart)) {
            conditions.push(`history.date_created >= :dateStart`);
            parameters.dateStart = param.listQueryParam.dateStart;
        } else if (checker.isDate(param.listQueryParam.dateEnd)) {
            conditions.push(`history.date_created >= :dateEnd`);
            parameters.dateEnd = param.listQueryParam.dateEnd
        }

        const sqlWithConditions = `${baseSql} where ${conditions.join(' and ')}`

        const paginationSql = this.getPaginationSql(sqlWithConditions);
        const countSql = this.getCountSql(sqlWithConditions);

        const rowStart: number = ((param.listQueryParam.pageIndex - 1) * param.listQueryParam.pageSize) + 1;
        const rowEnd: number = rowStart + param.listQueryParam.pageSize - 1;
        parameters.rowStart = rowStart;
        parameters.rowEnd = rowEnd;

        const paginationQueryParam = this.parseSql(paginationSql, parameters)
        const countQueryParam = this.parseSql(countSql, parameters)

        const listRet: MemberGameHistoryDbViewModel[] = await this.entityManager.query(paginationQueryParam.sql, paginationQueryParam.parameters);
        const countRet: QueryCountDbModel = await this.entityManager.query(countQueryParam.sql, countQueryParam.parameters);
        const memberGameItemOrderEntities = listRet
        const dataAmount = countRet[0].count
        const ret = new ListResult<AdminMemberGameHistoryVM>(true);

        ret.items = memberGameItemOrderEntities.map(entity => {
            const { id, memberId, dateCreated, gameScore, gamePoint, dateFinished } = entity
            const item: AdminMemberGameHistoryVM = {
                id,
                memberId,
                dateCreated,
                score: gameScore,
                point: gamePoint,
                isFinish: !checker.isNullOrUndefinedObject(dateFinished),
                dateFinished,
                game: {
                    id: entity.gameId,
                    name: entity.gameName,
                },
                member: {
                    id: entity.memberId,
                    nickName: entity.memberNickName,
                    carPlusMemberId: entity.carPlusMemberId,
                    shortId: entity.memberShortId
                }
            }

            return item
        })

        ret.page = {
            pageAmount: Math.ceil(dataAmount / param.listQueryParam.pageSize),
            dataAmount
        }

        return ret;
    }

    async exportGameHistory(param: PageQuery<AdminMemberGameHistoryParameterVM>): Promise<ExportResult> {
        const memberGameHistoryRepository = this.entityManager.getRepository(MemberGameHistoryEntity);

        const conditions: string[] = [`memberGameHistory.date_finished is not null`];
        const parameters: any = {};

        
        if (!checker.isNullOrUndefinedOrWhiteSpace(param.params.memberId)) {
            conditions.push(`memberVM.car_plus_member_id = :memberId`);
            parameters.memberId = param.params.memberId
        }

        if (!checker.isNullOrUndefinedOrWhiteSpace(param.params.shortId)) {
            conditions.push(`memberVM.short_id = :shortId`);
            parameters.shortId= param.params.shortId
        }

        if (checker.isDate(param.listQueryParam.dateEnd) && checker.isDate(param.listQueryParam.dateStart)) {
            conditions.push(`memberGameHistory.date_created between :dateStart and :dateEnd`);
            parameters.dateStart = param.listQueryParam.dateStart
            parameters.dateEnd = param.listQueryParam.dateEnd
        } else if (checker.isDate(param.listQueryParam.dateStart)) {
            conditions.push(`memberGameHistory.date_created >= :dateStart`);
            parameters.dateStart = param.listQueryParam.dateStart;
        } else if (checker.isDate(param.listQueryParam.dateEnd)) {
            conditions.push(`memberGameHistory.date_created >= :dateEnd`);
            parameters.dateEnd = param.listQueryParam.dateEnd
        }
        
        const memberGameHistoryEntities = await memberGameHistoryRepository.createQueryBuilder('memberGameHistory')
            .innerJoinAndSelect('memberGameHistory.memberVM', 'memberVM')
            .innerJoinAndSelect('memberGameHistory.gameVM', 'gameVM')
            .where(conditions.join(' and '))
            .orderBy('memberGameHistory.date_created', 'DESC')
            .setParameters(parameters)
            .getMany();


        const items = memberGameHistoryEntities.map(entity => {
            const { dateCreated, gameScore, gamePoint, dateFinished } = entity

            const item: ExportGameHistoryItem = {
                id: entity.memberVM.carPlusMemberId,
                carPlusMemberId: entity.memberVM.carPlusMemberId,
                memberNickName: entity.memberVM.nickName,
                dateCreated: dateCreated,
                gameName: entity.gameVM.name,
                gameScore,
                gamePoint,
                dateFinished,
                memberShortId: entity.memberVM.shortId
            }

            return item
        })

        const ret = exporter.exportByFieldDicAndData({
            data: items,
            fieldNameDic: {
                memberShortId: "遊戲ID",
                carPlusMemberId: "格上會員ID",
                memberNickName: "會員暱稱",
                gameName: "遊戲項目",
                gameScore: "獲得分數",
                gamePoint: "獲得超人幣",
                dateCreated: "遊戲開始時間",
                dateFinished: "遊戲完成時間"
            },
            fileName: "遊戲紀錄",
            sheetName: "sheet1"
        })
        return ret;
    }

}